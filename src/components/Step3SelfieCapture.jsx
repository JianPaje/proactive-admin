// src/components/Step3SelfieCapture.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const Step3SelfieCapture = ({ selfieImage, setSelfieImage, onSubmit, onBack }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null); 
    const [isCapturing, setIsCapturing] = useState(true);
    const [instruction, setInstruction] = useState('Loading AI models...');
    const detectionIntervalRef = useRef(null);
    const circleRef = useRef(null);

    const stopStream = useCallback(() => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        // Applying optional chaining throughout the chain as per SonarQube's preference (S6582)
        videoRef.current?.srcObject?.getTracks()?.forEach(track => track.stop());
        if (videoRef.current) { // Still need this check to safely set srcObject to null
            videoRef.current.srcObject = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const captureSelfie = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        setInstruction('Picture taken!');

        // Create a new canvas element for the actual image data URL
        const canvas = document.createElement('canvas'); 
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        setSelfieImage(imageUrl);
        setIsCapturing(false);
        stopStream();
    }, [setSelfieImage, stopStream]);

    const startFaceDetection = useCallback(() => {
        const faceapi = window.faceapi;
        setInstruction('Position your face in the circle');

        const video = videoRef.current;
        const canvas = canvasRef.current; 
        if (!video || !canvas) {
            console.warn("Video or canvas element not found.");
            return;
        }

        const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
        faceapi.matchDimensions(canvas, displaySize);

        const circleElement = circleRef.current;
        if (!circleElement) {
            console.warn("Circle element for selfie frame not found.");
            return;
        }

        const circleRect = circleElement.getBoundingClientRect();
        
        const displayedVideoWidth = video.offsetWidth;
        const displayedVideoHeight = video.offsetHeight;

        const videoWidth = video.videoWidth;
       

        const scaleX_videoToDisplay = displayedVideoWidth / videoWidth;
        const scaleY_videoToDisplay = displayedVideoHeight / video.videoHeight; 

        detectionIntervalRef.current = setInterval(async () => {
            if (video.readyState < 2) { 
                return;
            }

            const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); 

  
            if (detections) {
                const box = detections.box; 
                
                const mirroredBoxX_native = videoWidth - (box.x + box.width);
                const mirroredBoxY_native = box.y; 
                const mirroredBoxWidth_native = box.width;
                const mirroredBoxHeight_native = box.height;

                const faceDisplayX = mirroredBoxX_native * scaleX_videoToDisplay;
                const faceDisplayY = mirroredBoxY_native * scaleY_videoToDisplay;
                const faceDisplayWidth = mirroredBoxWidth_native * scaleX_videoToDisplay;
                const faceDisplayHeight = mirroredBoxHeight_native * scaleY_videoToDisplay;

        
                ctx.beginPath();
                ctx.rect(faceDisplayX, faceDisplayY, faceDisplayWidth, faceDisplayHeight);
                ctx.strokeStyle = 'red'; 
                ctx.lineWidth = 2;
                ctx.stroke();

                const faceCenterX_display = faceDisplayX + faceDisplayWidth / 2;
                const faceCenterY_display = faceDisplayY + faceDisplayHeight / 2;

              
                ctx.beginPath();
                ctx.arc(faceCenterX_display, faceCenterY_display, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();

                
                const videoAbsRect = video.getBoundingClientRect();
                const faceScreenX_abs = videoAbsRect.left + faceDisplayX;
                const faceScreenY_abs = videoAbsRect.top + faceDisplayY;
                const faceScreenWidth_abs = faceDisplayWidth;
                const faceScreenHeight_abs = faceDisplayHeight;

                const faceCenterX_abs = faceScreenX_abs + faceScreenWidth_abs / 2;
                const faceCenterY_abs = faceScreenY_abs + faceScreenHeight_abs / 2;

              
                const circleCenterX = circleRect.left + circleRect.width / 2;
                const circleCenterY = circleRect.top + circleRect.height / 2;
                const circleRadius = circleRect.width / 2;

                const distanceToCenter = Math.sqrt(
                    Math.pow(faceCenterX_abs - circleCenterX, 2) +
                    Math.pow(faceCenterY_abs - circleCenterY, 2)
                );

                const MIN_FACE_WIDTH_RATIO = 0.5; 
                const MIN_FACE_HEIGHT_RATIO = 0.5; 
                const MAX_CENTER_DEVIATION_RATIO = 0.25; 


                const isCentered = distanceToCenter < (circleRadius * MAX_CENTER_DEVIATION_RATIO);
                const isWideEnough = faceScreenWidth_abs >= (circleRadius * 2 * MIN_FACE_WIDTH_RATIO);
                const isTallEnough = faceScreenHeight_abs >= (circleRadius * 2 * MIN_FACE_HEIGHT_RATIO);


                if (isCentered && isWideEnough && isTallEnough) {
                    setInstruction('Face detected! Capturing...');
                    circleElement.style.borderColor = 'green'; 
                    clearInterval(detectionIntervalRef.current); 
                    captureSelfie(); 
                } else {
                    setInstruction('Position your face correctly within the circle');
                    circleElement.style.borderColor = 'blue'; 
                }
            } else {
                setInstruction('No face detected. Please ensure good lighting and clear view.');
                circleElement.style.borderColor = 'blue'; 
            }
        }, 150); 
    }, [captureSelfie]); 

    const startSelfieProcess = useCallback(async () => {
        setIsCapturing(true);
        setSelfieImage(null);

        const faceapi = window.faceapi;
        if (!faceapi) {
            setInstruction('Face detection library not found. Make sure face-api.js is loaded.');
            return;
        }
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
        try {
            setInstruction('Loading AI models...');
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    startFaceDetection();
                };
            }
        } catch (err) {
            console.error("Error in selfie process:", err);
            setInstruction('Could not start camera. Please check permissions and ensure face-api.js is loaded.');
        }
    }, [setSelfieImage, startFaceDetection]);

    useEffect(() => {
        startSelfieProcess();
        return () => stopStream();
    }, [startSelfieProcess, stopStream]);

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex items-center">
                <button onClick={onBack} className="text-2xl">&times;</button>
                <h2 className="text-xl font-semibold mx-auto">Scan Face</h2>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <p className="text-lg text-gray-700 mb-8 text-center">{instruction}</p>
                
                {isCapturing ? (
                    <div 
                        ref={circleRef} 
                        className="w-[80vw] h-[80vw] max-w-[256px] max-h-[256px] sm:w-72 sm:h-72 rounded-full border-4 border-blue-500 overflow-hidden bg-black flex items-center justify-center relative"
                    >
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover" 
                            style={{transform: 'scaleX(-1)'}} 
                        >
                            <track kind="captions" />
                        </video>
                        <canvas 
                            ref={canvasRef} 
                            className="absolute top-0 left-0" 
                            style={{transform: 'scaleX(-1)'}} 
                        ></canvas>
                    </div>
                ) : (
                    <div className="w-64 h-64 rounded-full border-4 border-green-500 overflow-hidden bg-black flex items-center justify-center">
                        <img src={selfieImage} alt="Selfie Preview" className="w-full h-full object-cover" />
                    </div>
                )}

                {!isCapturing && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                        <button onClick={startSelfieProcess} className="w-full px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition">Retake</button>
                        <button onClick={onSubmit} className="w-full px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">Continue</button>
                    </div>
                )}
            </main>

            <footer className="text-center p-4 text-gray-400">
                Powered by ZOLOZ
            </footer>
        </div>
    );
};

Step3SelfieCapture.propTypes = {
    selfieImage: PropTypes.string,
    setSelfieImage: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default Step3SelfieCapture;