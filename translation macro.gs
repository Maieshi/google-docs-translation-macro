function translateAndSaveWithFormatting() {
    var originalDoc = DocumentApp.getActiveDocument();
    var translatedDocName = "Portfolio RU";
    var translatedDoc = null;

    var files = DriveApp.getFilesByName(translatedDocName);
    if (files.hasNext()) {
        translatedDoc = DocumentApp.openById(files.next().getId());
    } else {
        translatedDoc = DocumentApp.create(translatedDocName);
    }

    var originalBody = originalDoc.getBody();
    var translatedBody = translatedDoc.getBody();
    translatedBody.clear();

    for (var i = 0; i < originalBody.getNumChildren(); i++) {
        var element = originalBody.getChild(i);
        var elementType = element.getType();


        switch (elementType) {
            case DocumentApp.ElementType.PARAGRAPH:
            case DocumentApp.ElementType.HEADING:
            case DocumentApp.ElementType.LIST_ITEM:
                translateTextElementWithFormatting(element, translatedBody);
                break;
            case DocumentApp.ElementType.TABLE:
                translateTableWithFormatting(element.asTable(), translatedBody);
                break;
            case DocumentApp.ElementType.INLINE_IMAGE:
                copyImage(element.asInlineImage(), translatedBody);
                break;
            case DocumentApp.ElementType.TABLE_OF_CONTENTS:
            case DocumentApp.ElementType.UNSUPPORTED:
                continue; 
            default:
                Logger.log("Skipped unknown element: " + elementType);
        }
    }
    Logger.log("Translation completed successfully.");
}

//TODOD: save text formatting in translated copy

function translateTextElementWithFormatting(element, translatedBody) {
    if (!element.editAsText) return;

    var text = element.editAsText();
    var originalText = text.getText().trim();
    if (!originalText) return;

    try {
        var translatedText = LanguageApp.translate(originalText, "en", "ru");
        if (!translatedText) return;

        var newElement = translatedBody.appendParagraph("");
        newElement.setHeading(element.getHeading());

        var originalParts = text.getText().split(/(\s+)/); 
        var translatedParts = translatedText.split(/(\s+)/);
        
        for (var i = 0; i < originalParts.length && i < translatedParts.length; i++) {
            var newPart = newElement.appendText(translatedParts[i]);
            newPart.setAttributes(text.getAttributes(i));
        }
    } catch (e) {
        Logger.log("Error translating text: " + e.message);
    }
}

function translateTableWithFormatting(table, translatedBody) {
    var newTable = translatedBody.appendTable();
    for (var r = 0; r < table.getNumRows(); r++) {
        var row = table.getRow(r);
        var newRow = newTable.appendTableRow();
        for (var c = 0; c < row.getNumCells(); c++) {
            var cell = row.getCell(c);
            var originalText = cell.getText().trim();
            var newCell = newRow.appendTableCell("");

            if (originalText) {
                try {
                    var translatedText = LanguageApp.translate(originalText, "en", "ru");
                    newCell.setText(translatedText);
                } catch (e) {
                    Logger.log("Error translating cell: " + e.message);
                    newCell.setText(originalText);
                }
            }
        }
    }
}


//TDOD:remake a image compying 
function copyImage(image, translatedBody) {
    if (!image) return;

    try {
        var blob = image.getBlob();
        if (blob) {
            translatedBody.appendImage(blob);
            Logger.log("Image copied successfully.");
        }
    } catch (e) {
        Logger.log("Error copying image: " + e.message);
    }
}
