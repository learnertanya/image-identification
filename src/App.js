import React, { useState, useEffect, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import {CircularProgress} from "@mui/material"

function App() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  const imageRef = useRef();
  const textInputRef = useRef();
  const fileInputRef = useRef();

  const loadModel = async () => {
    setIsModelLoading(true);
    try {
      const model = await mobilenet.load();
      setModel(model);
      setIsModelLoading(false);
    } catch (err) {
      console.log(err);
      setIsModelLoading(false);
    }
  };

  const uploadImage = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  };

  const identify = async () => {
    textInputRef.current.value = "";
    const results = await model.classify(imageRef.current);
    setResults(results);
  };

  const handleOnChange = (e) => {
    setImageUrl(e.target.value);
    setResults([]);
  };



  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  console.log(imageUrl);

  useEffect(() => {
    loadModel();
  }, []);

  useEffect(() => {
    if (imageUrl && !history.includes(imageUrl)) {
      setHistory([imageUrl, ...history]);
    }
  }, [imageUrl]);

  if (isModelLoading) {
    return (
      <div className = "loading">
        <CircularProgress color = "secondary" />
        <h2>Mobilenet loading...</h2>
      </div>
    )
  }

  return (
    <div className="App">
      <h1 className="header">Image ID</h1>
      <div className="inputHolder">
        <input
          type="file"
          accept="image/*"
          capture="camera"
          className="uploadInput"
          onChange={uploadImage}
          ref={fileInputRef}
        />
        <button className="uploadImage" onClick={triggerUpload}>
          Upload Image
        </button>
        <span className="or">OR</span>
        <input
          placeholder="Paste Image URL"
          ref={textInputRef}
          onChange={handleOnChange}
        />

      </div>
      <div className="mainWrapper">
        <div className="mainContent">
          <div className="imageHolder">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Upload Preview"
                crossOrigin="anonymous"
                ref={imageRef}
              />
            )}
          </div>
          {results.length > 0 && (
            <div className="resultsHolder">
              {results.map((result, index) => {
                return (
                  <div className="result" key={result.className}>
                    <span className="name">{result.className}</span>
                    <span className="confidence">
                      Confidence level: {(result.probability * 100).toFixed(2)}%{" "}
                      {index === 0 && (
                        <span className="bestGuess">Best Guess</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {imageUrl && (
          <button className="button" onClick={identify}>
            Identify Image
          </button>
        )}
      </div>
      {history.length > 0 && (
        <div className="recentPredictions">
          <h2>Recent Images</h2>
          <div className="recentImages">
            {history.map((image, index) => (
              <div className="recentPrediction" key={`${image}${index}`}>
                <img src={image} alt="Recent Prediction" onClick = {()=> setImageUrl(image)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
