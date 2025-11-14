// Модуль работы с Firestore
class FirestoreManager {
    constructor(db, authManager) {
        this.db = db;
        this.authManager = authManager;
        this.repairsUnsubscribe = null;
        this.repairsData = [];
        this.onDataUpdateCallback = null;
    }

    // Инициализация подписки на обновления
    init(callback) {
        if (!this.db || !this.authManager.getCurrentUser()) {
            console.error('Firebase DB or user not available');
            return;
        }

        this.onDataUpdateCallback = callback;

        // Отписываемся от предыдущих обновлений
        if (this.repairsUnsubscribe) {
            this.repairsUnsubscribe();
        }

        const currentUser = this.authManager.getCurrentUser();

        // Подписываемся на обновления для текущего пользователя
        this.repairsUnsubscribe = this.db.collection('repairs')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                this.repairsData = [];
                
                snapshot.forEach(doc => {
                    const repair = doc.data();
                    repair.id = doc.id;
                    this.repairsData.push(repair);
                });

                if (callback) {
                    callback(this.repairsData);
                }
            }, error => {
                console.error('Realtime update error:', error);
                throw this.getFirestoreErrorMessage(error);
            });
    }

    // Отписка от обновлений
    unsubscribe() {
        if (this.repairsUnsubscribe) {
            this.repairsUnsubscribe();
            this.repairsUnsubscribe = null;
        }
        this.repairsData = [];
    }

    // Получить все данные о ремонтах
    getRepairsData() {
        return this.repairsData;
    }

    // Добавить запись о ремонте
    async addRepair(identifier, hours, date) {
        const currentUser = this.authManager.getCurrentUser();
        
        if (!currentUser || !currentUser.uid) {
            throw new Error('Пользователь не аутентифицирован');
        }

        // Проверка дубликатов
        const isDuplicate = await this.checkDuplicateRecord(identifier, date);
        if (isDuplicate) {
            throw new Error('Запись с таким идентификатором на эту дату уже существует');
        }

        try {
            await this.db.collection('repairs').add({
                userId: currentUser.uid,
                identifier,
                date,
                hours,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Add repair error:', error);
            throw this.getFirestoreErrorMessage(error);
        }
    }

    // Проверка дубликатов
    async checkDuplicateRecord(identifier, date) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return false;

        try {
            const snapshot = await this.db.collection('repairs')
                .where('userId', '==', currentUser.uid)
                .where('identifier', '==', identifier)
                .where('date', '==', date)
                .limit(1)
                .get();

            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking duplicates:', error);
            // Если индекс не создан, не блокируем добавление
            if (error.code === 'failed-precondition') {
                return false;
            }
            throw error;
        }
    }

    // Обновить запись
    async updateRepair(repairId, hours) {
        try {
            await this.db.collection('repairs').doc(repairId).update({
                hours
            });
        } catch (error) {
            console.error('Update repair error:', error);
            throw this.getFirestoreErrorMessage(error);
        }
    }

    // Удалить запись
    async deleteRepair(repairId) {
        try {
            await this.db.collection('repairs').doc(repairId).delete();
        } catch (error) {
            console.error('Delete repair error:', error);
            throw this.getFirestoreErrorMessage(error);
        }
    }

    // Получить сообщение об ошибке Firestore
    getFirestoreErrorMessage(error) {
        const messages = {
            'permission-denied': 'Недостаточно прав. Проверьте правила Firestore.',
            'failed-precondition': 'Требуется создать индекс. Проверьте консоль.',
            'unavailable': 'Сервис временно недоступен. Проверьте подключение к интернету.'
        };

        const message = messages[error.code] || `Ошибка Firestore: ${error.message}`;
        return new Error(message);
    }
}

