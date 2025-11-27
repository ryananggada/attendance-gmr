import Webcam from 'react-webcam';
import { Button } from './ui/button';
import { useRef } from 'react';

const videoConstraints = {
  width: { ideal: 960 },
  height: { ideal: 1280 },
  facingMode: 'user',
};

type CameraProps = {
  setCapturedImage: (img: string | null) => void;
}

export default function Camera({ setCapturedImage }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = () => {
    const img = webcamRef.current?.getScreenshot();
    setCapturedImage(img ?? null);
  };

  return (
    <>
      <div className="relative w-full max-w-md mx-auto">
        <div className="aspect-[3/4] overflow-hidden bg-black flex items-center justify-center">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="h-full w-auto object-cover"
          />
        </div>
      </div>

      <Button onClick={capture}>Ambil foto</Button>
    </>
  );
}
