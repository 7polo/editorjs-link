# Link 
Link Tool for Editor.js 2.0

show link page by using iframe

drag to modify the block height

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

1. npm
```nodejs
npm i @7polo/editorjs-link
```

2. init & config
```javascript
var editor = EditorJS({
  ...
  tools: {
    ...
    link: Link
  }
  ...
});
```

## Output data

This Tool returns code.

```json
{
  "type" : "link",
  "data" : {
    "url" : "https://www.example.com/image.jpg",
    "meta": {
      "height":  200
    }
  }
}
```


