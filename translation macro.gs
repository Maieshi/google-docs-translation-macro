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
Utilities.sleep(1000);
        switch (elementType) {
    case DocumentApp.ElementType.PARAGRAPH:
       var newParagraph = translatedBody.appendParagraph("");  
                copyParagraphFormat(element, translatedBody);  

                
                for (var j = 0; j < element.getNumChildren(); j++) {
                    var child = element.getChild(j);
                    if (child.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
                        Logger.log(" Found inline image inside paragraph!");
                        copyImage(child.asInlineImage(), newParagraph);  
                    }
                }
        break;  

    case DocumentApp.ElementType.HEADING:
    case DocumentApp.ElementType.LIST_ITEM:
        translateTextElementWithFormatting(element, translatedBody);
        break;

    case DocumentApp.ElementType.TABLE:
        translateTableWithFormatting(element.asTable(), translatedBody);
        break;

    case DocumentApp.ElementType.INLINE_IMAGE:
        Logger.log("Found an inline image!");
        copyImage(element.asInlineImage(), translatedBody);
        break;

    default:
        Logger.log("Skipped unknown element: " + elementType);
}
    }
    Logger.log("Translation completed successfully.");
}
//TODO:make text and heaaders fromatted
function translateTextElementWithFormatting(element, translatedBody) {
    if (!element.editAsText && !element.asParagraph) return;

    var newElement = translatedBody.appendParagraph(""); 

    
    if (element.editAsText) {
        var text = element.editAsText();
        var originalText = text.getText().trim();
        if (!originalText) return;

        try {
            var translatedText = LanguageApp.translate(originalText, "en", "ru");
            if (!translatedText) return;

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
}

function copyParagraphFormat(element,translatedBody)
{
   var attributes = element.getAttributes();      

  var spn = LanguageApp.translate(element.getText(), 'en', 'es');
  var newParagraph = translatedBody.appendParagraph(spn);

  
  newParagraph.setAttributes(attributes)
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

//TODO: make images formmatted
function copyImage(image, target) {
    if (!image) {
        Logger.log("No image found to copy.");
        return;
    }

    try {
        var blob = image.getBlob();
        if (blob) {
            
            target.appendInlineImage(blob);
            Logger.log(" Image copied successfully.");
        } else {
            Logger.log(" Image blob is null.");
        }
    } catch (e) {
        Logger.log(" Error copying image: " + e.message);
    }
}