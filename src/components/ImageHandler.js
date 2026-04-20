import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import '../styles/ImageHandler.css';
import 'react-image-crop/dist/ReactCrop.css';

const ImageHandler = ({ onClose, onSave }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({
        unit: 'px',
        width: 500,
        height: 80,
        x: 0,
        y: 0,
    });
    const [imageName, setImageName] = useState('');
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
    const imageRef = useRef(null);

    const onImageLoaded = (image) => {
        imageRef.current = image;
    };

    const onCropComplete = async (crop) => {
        if (!imageRef.current) {
            console.error("Image not loaded yet.");
            return;
        }
        if (imageRef.current && crop.width && crop.height) {
            const croppedImageUrl = await getCroppedImage(imageRef.current, crop, "newFile.jpeg");
            setCroppedImageUrl(croppedImageUrl);
        }
    };

    const getCroppedImage = (image, crop, fileName) => {
        /*const image = imageRef.current;*/
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error("Canvas is empty");
                    return;
                }
                blob.name = fileName;
                
                const fileUrl = window.URL.createObjectURL(blob);
                resolve(fileUrl);
               // window.URL.revokeObjectURL(fileUrl);

            }, 'image/jpeg', 1);
        });
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };
    const handleSave = async () => {
        if (!imageName.trim()) {
            alert('Будь ласка, введіть назву зображення');
            return;
        }
        if (!croppedImageUrl) {
            alert('Будь ласка, виберіть та обріжте зображення');
            return;
        }

        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        
        onSave({
            file: blob,
            preview: URL.createObjectURL(blob),
            name: imageName || "cover.jpg"
        });
        
        onClose();
    };

    return (
        <div className="modal-overlay-crop">
            <div className="modal-content-crop">
                <div className="form-crop">
                    <h2>Додати обкладинку</h2>

                    <input
                        type="text"
                        value={imageName}
                        onChange={(e) => setImageName(e.target.value)}
                        placeholder="Назва зображення"
                        className="input-crop"
                        required
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="input-crop"
                        required
                    />

                    {imageSrc && (
                        <div className="crop-container">
                            <ReactCrop
                                crop={crop}
                                aspect={500 / 80}
                                locked
                                
                                onImageLoaded={onImageLoaded}
                                onComplete={onCropComplete}
                                onChange={(newCrop) => setCrop(newCrop)}
                            >
                                <img
                                    ref={imageRef}
                                    src={imageSrc}
                                    style={{ maxWidth: '100%' }}
                                    alt="Завантажене зображення"
                                />
                            </ReactCrop>
                        </div>
                    )}

                    {croppedImageUrl && (
                        <img alt="Crop" style={{ maxWidth: "100%" }} src={croppedImageUrl} />
                    )}

                    <div className="button-group-crop">
                        <button type="button" onClick={onClose} className="button-crop">
                            Скасувати
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="save-button-crop"
                            disabled={!croppedImageUrl || !imageName.trim()}
                        >
                            Зберегти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageHandler;
