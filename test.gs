function debugDocumentElements() {
    var doc = DocumentApp.getActiveDocument();
    var body = doc.getBody();

    Logger.log("Starting document scan...");

    for (var i = 0; i < body.getNumChildren(); i++) {
        var element = body.getChild(i);
        var elementType = element.getType();
        
        Logger.log("Found element [" + i + "]: " + elementType);

        if (elementType === DocumentApp.ElementType.INLINE_IMAGE) {
            Logger.log("Found an INLINE_IMAGE at index " + i);
        } 
        else if (elementType === DocumentApp.ElementType.DRAWING) {
            Logger.log("Found a DRAWING at index " + i);
        } 
        else if (elementType === DocumentApp.ElementType.PARAGRAPH) {
            var paragraph = element.asParagraph();
            for (var j = 0; j < paragraph.getNumChildren(); j++) {
                var child = paragraph.getChild(j);
                if (child.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
                    Logger.log("Found an INLINE_IMAGE inside a PARAGRAPH at index " + i + ", child " + j);
                }
            }
        }
        else {
            Logger.log("Skipped unknown element: " + elementType);
        }
    }

    Logger.log("Document scan completed.");
}