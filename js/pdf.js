// Модуль экспорта PDF
class PDFExporter {
    constructor(ui) {
        this.ui = ui;
    }

    // Экспорт истории в PDF с прогресс-баром
    async exportFullHistoryPDF(repairsData) {
        const { jsPDF } = window.jspdf;
        const progress = this.ui.showProgressBar('Экспорт PDF...');

        try {
            // Шаг 1: Подготовка данных (10%)
            progress.update(10);
            await this.delay(100);

            const doc = new jsPDF({ orientation: 'landscape' });
            progress.update(20);

            // Шаг 2: Создание canvas (30%)
            progress.update(30);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const scale = 2;
            canvas.width = 1600 * scale;
            canvas.height = 1200 * scale;
            ctx.scale(scale, scale);
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            progress.update(40);

            // Шаг 3: Рендеринг заголовка (50%)
            progress.update(50);
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText('История ремонтов', 800, 50);

            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            const today = new Date().toLocaleDateString('ru-RU');
            ctx.fillText(`Дата экспорта: ${today}`, 50, 90);

            progress.update(60);

            // Шаг 4: Рендеринг таблицы (80%)
            progress.update(80);
            let y = 120;
            const headers = ['Дата', 'Идентификатор', 'Часы'];
            const colWidths = [220, 450, 180];
            const x = 50;

            // Заголовки
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(x, y - 25, colWidths[0], 30);
            ctx.fillRect(x + colWidths[0], y - 25, colWidths[1], 30);
            ctx.fillRect(x + colWidths[0] + colWidths[1], y - 25, colWidths[2], 30);

            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y - 25, colWidths[0], 30);
            ctx.strokeRect(x + colWidths[0], y - 25, colWidths[1], 30);
            ctx.strokeRect(x + colWidths[0] + colWidths[1], y - 25, colWidths[2], 30);

            ctx.fillStyle = 'black';
            ctx.fillText(headers[0], x + 15, y);
            ctx.fillText(headers[1], x + colWidths[0] + 15, y);
            ctx.fillText(headers[2], x + colWidths[0] + colWidths[1] + 15, y);

            y += 35;

            // Данные
            ctx.font = '14px Arial';
            const totalItems = repairsData.length;
            
            for (let i = 0; i < repairsData.length; i++) {
                const repair = repairsData[i];
                
                if (y > 1100) {
                    doc.addPage();
                    y = 80;
                }

                if (i % 2 === 0) {
                    ctx.fillStyle = '#fafafa';
                    ctx.fillRect(x, y - 20, colWidths[0] + colWidths[1] + colWidths[2], 25);
                }

                ctx.fillStyle = 'black';
                ctx.fillText(repair.date, x + 15, y);
                ctx.fillText(repair.identifier, x + colWidths[0] + 15, y);
                ctx.fillText(repair.hours.toFixed(1), x + colWidths[0] + colWidths[1] + 15, y);

                y += 25;

                // Обновление прогресса
                const progressPercent = 60 + (i / totalItems) * 30;
                progress.update(progressPercent);
                await this.delay(10); // Небольшая задержка для плавности
            }

            progress.update(95);

            // Шаг 5: Конвертация в изображение и сохранение (100%)
            const imgData = canvas.toDataURL('image/png', 1.0);
            doc.addImage(imgData, 'PNG', 0, 0, 297, 210);

            const fileDate = new Date().toISOString().slice(0, 10);
            doc.save(`история_ремонтов_${fileDate}.pdf`);

            progress.update(100);
            await this.delay(300);
            progress.close();

            this.ui.showMessage('PDF успешно экспортирован!', true);
        } catch (error) {
            console.error('PDF export error:', error);
            progress.close();
            this.ui.showMessage('Ошибка при экспорте PDF: ' + error.message, false);
        }
    }

    // Утилита задержки
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

