import './App.css';
import styled from "styled-components"
import ObjectDetector from './ObjectDetector';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #1c2127;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;


function App() {
  return (
    <AppContainer>
      <ObjectDetector />
    </AppContainer>
  );
}

export default App;
