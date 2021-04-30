# Viewer for Google Cloud Vision API results

This is a simple viewer for the results that are returned bu the Google Cloud Vision API.

It accepts both the PNG/JPEG file was sent and the JSON file that represents the response that are returned by the request.

Example:
```
{
  "faceAnnotations": [],
  "landmarkAnnotations": [],
  "logoAnnotations": [],
  "labelAnnotations": [],
  "textAnnotations": [
    {
       "boundingPoly": {
        "vertices": [
          { "x": 1, "y": 9 },
          { "x": 647, "y": 9 },
          { "x": 647, "y": 170 },
          { "x": 1, "y": 170 }
        ],
        "normalizedVertices": []
      }
      ...
    },
  "localizedObjectAnnotations": [],
  "safeSearchAnnotation": null,
  "imagePropertiesAnnotation": null,
  "error": null,
  "cropHintsAnnotation": null,
  "fullTextAnnotation": {
    "pages": [
      {
        "blocks": [
          {
            "paragraphs": [
              {
                "words": [
                  {
                    "symbols": [
                      {
                        ...
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}      
```