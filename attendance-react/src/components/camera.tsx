import Webcam from 'react-webcam';
import { Button } from './ui/button';

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: 'user',
};

export default function Camera({ setCapturedImage }) {
  return (
    <>
      <Webcam videoConstraints={videoConstraints}>
        {({ getScreenshot }) => (
          <Button
            className="capture-btn"
            onClick={() => {
              const imageSrc = getScreenshot();
              setCapturedImage(imageSrc);
            }}
          >
            Ambil foto
          </Button>
        )}
      </Webcam>
    </>
  );
}
