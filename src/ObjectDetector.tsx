import React, { useRef, useState } from "react";
import styled from "styled-components";

import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const ObjectDetectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetectorContainer = styled.div`
  min-width: 200px;
  height: 400px;
  border: 3px solid #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TargetImg = styled.img`
  height: 100%;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SelectButton = styled.button`
  padding: 7px 10px;
  border: 2px solid transparent;
  background-color: #fff;
  color: #0a0f22;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  margin-top: 2em;
  cursor: pointer;
  transition: all 260ms ease-in-out;
  &:hover {
    background-color: transparent;
    border: 2px solid #fff;
    color: #fff;
  }
`;

type TargetBoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  classType: string;
  score: number;
};

const TargetBox = styled.div<TargetBoxProps>`
  position: absolute;
  left: ${({ x }) => x + "px"};
  top: ${({ y }) => y + "px"};
  width: ${({ width }) => width + "px"};
  height: ${({ height }) => height + "px"};
  border: 4px solid #0000ff;
  background-color: transparent;
  z-index: 20;
  &::before {
    content: "${({ classType, score }) => `${classType} ${score.toFixed(2)}%`}";
    color: #0000ff;
    font-weight: 500;
    font-size: 17px;
    position: absolute;
    top: -1.5em;
    left: -5px;
  }
`;

const ObjectDetector = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgData, setImgData] = useState<string>("");
  const [predictions, setPredictions] = useState<
    {
      bbox: number[];
      class: string;
      score: number;
    }[]
  >([]);
  const [isLoading, setLoading] = useState(false);

  const isEmptyPredictions = !predictions || predictions.length === 0;

  const openFilePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const normalizePredictions = (
    predictions: cocoSsd.DetectedObject[],
    imgSize: { width: number; height: number }
  ) => {
    if (!predictions || !imgSize || !imageRef) return predictions || [];
    return predictions.map((prediction) => {
      const imgWidth = imageRef.current?.width || 150;
      const imgHeight = imageRef.current?.height || 500;

      const x = (prediction.bbox[0] * imgWidth) / imgSize.width;
      const y = (prediction.bbox[1] * imgHeight) / imgSize.height;
      const width = (prediction.bbox[2] * imgWidth) / imgSize.width;
      const height = (prediction.bbox[3] * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  const detectObjectsOnImage = async (
    imageElement: HTMLImageElement,
    imgSize: { width: number; height: number }
  ) => {
    const model = await cocoSsd.load({});
    const predictions = await model.detect(imageElement, 6);
    const normalizedPredictions = normalizePredictions(predictions, imgSize);
    setPredictions(normalizedPredictions);
  };

  const onSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPredictions([]);
    if (!e.target.files) return;

    setLoading(true);
    const file = e.target.files[0];
    const imgData = URL.createObjectURL(file);
    setImgData(imgData);

    const imageElement = document.createElement("img");
    imageElement.src = imgData;

    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };
      await detectObjectsOnImage(imageElement, imgSize);
      setLoading(false);
    };
  };

  return (
    <ObjectDetectorContainer>
      <DetectorContainer>
        {imgData && <TargetImg src={imgData} ref={imageRef} />}
        {!isEmptyPredictions &&
          predictions.map((prediction, idx) => (
            <TargetBox
              key={idx}
              x={prediction.bbox[0]}
              y={prediction.bbox[1]}
              width={prediction.bbox[2]}
              height={prediction.bbox[3]}
              classType={prediction.class}
              score={prediction.score * 100}
            />
          ))}
      </DetectorContainer>
      <HiddenFileInput
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onSelectImage}
      />
      <SelectButton onClick={openFilePicker}>
        {isLoading ? "Recognizing..." : "Select Image"}
      </SelectButton>
    </ObjectDetectorContainer>
  );
};

export default ObjectDetector;
