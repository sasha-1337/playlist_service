import React, { useState, useRef, useEffect } from 'react';
import '../styles/DraggableButton.css';

const DraggableButton = ({ children, disabled = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const handleMouseDown = (e) => {
        // Якщо клік був по "clickable-area" — не перетягуємо
        if (e.target.closest('.clickable-area')) return;

        if (disabled) return;

        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });

        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;

        // Обмеження руху в межах вікна
        const maxX = window.innerWidth - (buttonRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (buttonRef.current?.offsetHeight || 0);

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startPos]);

    return (
        <div
            ref={buttonRef}
            className={`draggable-button ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                position: 'fixed',
                zIndex: isDragging ? 1000 : 1,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
        >
            {children}
        </div>
    );
};

export default DraggableButton;