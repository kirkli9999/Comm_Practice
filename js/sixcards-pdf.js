/**
 * 六張紙片：PDF 產生模組
 * Generates a printable PDF with 6 cards and cut lines
 * Uses html2canvas to capture the board (handles Chinese text)
 * and jsPDF to create the PDF with dashed cut lines overlay
 */

function generateSixCardsPDF(cards, audienceLabel, goalLabel, versionLabel) {
  if (!cards || cards.length === 0) {
    alert('請先生成六張紙片');
    return;
  }

  var board = document.getElementById('sixcardsBoard');
  if (!board) return;

  // Temporarily ensure board is visible and remove practice styles for clean capture
  var originalDisplay = board.style.display;
  board.style.display = '';

  // Save card states and remove practice classes for clean PDF
  var cardEls = board.querySelectorAll('.sixcards-card');
  var savedClasses = [];
  cardEls.forEach(function (el) {
    savedClasses.push(el.className);
    el.classList.remove('active', 'practiced', 'practice-clickable');
  });

  // Use html2canvas to capture the board
  html2canvas(board, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  }).then(function (canvas) {
    // Restore card states
    cardEls.forEach(function (el, i) {
      el.className = savedClasses[i];
    });
    board.style.display = originalDisplay;

    // Create PDF - A4 landscape
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    var pageW = 297;
    var pageH = 210;
    var margin = 10;
    var contentW = pageW - 2 * margin;
    var contentH = pageH - 2 * margin - 12; // reserve footer space

    // Add captured image
    var imgData = canvas.toDataURL('image/png');
    var imgAspect = canvas.width / canvas.height;
    var fitW = contentW;
    var fitH = fitW / imgAspect;

    if (fitH > contentH) {
      fitH = contentH;
      fitW = fitH * imgAspect;
    }

    var imgX = margin + (contentW - fitW) / 2;
    var imgY = margin;

    doc.addImage(imgData, 'PNG', imgX, imgY, fitW, fitH);

    // Draw cut lines (dashed) over the image
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([3, 3], 0);

    // Horizontal line at 1/2 of image height
    var midY = imgY + fitH / 2;
    doc.line(imgX, midY, imgX + fitW, midY);

    // Two vertical lines at 1/3 and 2/3 of image width
    var thirdX1 = imgX + fitW / 3;
    var thirdX2 = imgX + (fitW * 2) / 3;
    doc.line(thirdX1, imgY, thirdX1, imgY + fitH);
    doc.line(thirdX2, imgY, thirdX2, imgY + fitH);

    // Small scissor marks at edges
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('✂', imgX - 5, midY + 1);
    doc.text('✂', thirdX1 - 1, imgY - 2);
    doc.text('✂', thirdX2 - 1, imgY - 2);

    // Footer
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    var footerY = pageH - 8;
    var dateStr = new Date().toLocaleDateString('zh-TW');
    doc.text(
      'Six Cards Communication Tool | ' + versionLabel +
      ' | Target: ' + audienceLabel +
      ' | Goal: ' + goalLabel +
      ' | ' + dateStr,
      margin, footerY
    );

    // Save
    doc.save('six-cards-' + versionLabel + '.pdf');

  }).catch(function (err) {
    // Restore on error
    cardEls.forEach(function (el, i) {
      el.className = savedClasses[i];
    });
    board.style.display = originalDisplay;
    console.error('PDF generation failed:', err);
    alert('PDF 產生失敗，請稍後再試');
  });
}
