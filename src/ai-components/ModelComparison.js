import React, { useState, useEffect, useRef } from 'react';
import { FaFlask, FaTrophy, FaChartBar, FaTimes } from 'react-icons/fa';
import '../styles/ModelComparison.css';

const ModelComparison = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [comparisonResults, setComparisonResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);


    const AI_API_URL = "http://localhost:5001/api/ai";

    // DRAG HANDLERS
    const handleMouseDown = (e) => {
        // Не починаємо drag на інтерактивних елементах
        if (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'BUTTON' ||
            e.target.closest('.search-form') ||
            e.target.closest('.results-list') ||
            e.target.closest('.close-button')) {
            return;
        }

        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, position]);

    const handleTestModels = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError("Введіть запит для тестування");
            return;
        }

        setIsLoading(true);
        setError(null);
        setComparisonResults(null);

        try {
            const response = await fetch(`${AI_API_URL}/test-models`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    top_k: 5
                })
            });

            if (!response.ok) {
                throw new Error('Помилка тестування моделей');
            }

            const data = await response.json();
            setComparisonResults(data);

        } catch (err) {
            console.error("Помилка тестування:", err);
            setError("Помилка з'єднання з AI сервісом");
        } finally {
            setIsLoading(false);
        }
    };

    const getModelColor = (modelName) => {
        const colors = {
            'LaBSE': '#10b981',      // зелений
            'MiniLM': '#3b82f6',     // синій
            'DistilUSE': '#f59e0b'   // помаранчевий
        };
        return colors[modelName] || '#6b7280';
    };

    const getSimilarityColor = (similarity) => {
        if (similarity >= 0.7) return '#22c55e';
        if (similarity >= 0.5) return '#eab308';
        return '#ef4444';
    };

    return (
        <div className="model-comparison-container"
            ref={containerRef}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="comparison-header">
                <FaFlask className="comparison-icon" />
                <h2>Тестування AI Моделей</h2>
                {onClose && (
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                )}
            </div>

            <form onSubmit={handleTestModels} className="comparison-form">
                <div className="comparison-input-wrapper">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Введіть тестовий запит (наприклад: 'сумна пісня про кохання')"
                        className="comparison-input"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className="comparison-button"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? '⚗️ Тестую моделі...' : '🧪 Порівняти моделі'}
                </button>
            </form>

            {error && (
                <div className="comparison-error">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="comparison-loading">
                    <div className="spinner"></div>
                    <p>Тестування 3 різних моделей...</p>
                    <small>Це може зайняти 10-30 секунд</small>
                </div>
            )}

            {comparisonResults && (
                <div className="comparison-results">
                    <div className="results-summary">
                        <h3>📊 Результати порівняння</h3>
                        <div className="query-info">
                            <p><strong>Запит:</strong> {comparisonResults.query}</p>
                            <p><strong>Нормалізований:</strong> {comparisonResults.normalized_query}</p>
                        </div>

                        {comparisonResults.best_model && (
                            <div className="best-model-banner">
                                <FaTrophy className="trophy-icon" />
                                <div>
                                    <strong>Найкраща модель: {comparisonResults.best_model}</strong>
                                    <p>{comparisonResults.recommendation}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="models-grid">
                        {Object.entries(comparisonResults.comparison).map(([modelName, modelData]) => (
                            <div
                                key={modelName}
                                className={`model-card ${modelName === comparisonResults.best_model ? 'best' : ''}`}
                                style={{ borderColor: getModelColor(modelName) }}
                            >
                                <div className="model-card-header" style={{ background: getModelColor(modelName) }}>
                                    <h4>{modelName}</h4>
                                    {modelName === comparisonResults.best_model && (
                                        <FaTrophy className="winner-badge" />
                                    )}
                                </div>

                                {modelData.error ? (
                                    <div className="model-error">
                                        ❌ Помилка: {modelData.error}
                                    </div>
                                ) : (
                                    <>
                                        <div className="model-stats">
                                            <div className="stat">
                                                <span className="stat-label">Середня схожість</span>
                                                <span className="stat-value">
                                                    {(modelData.avg_similarity * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Макс схожість</span>
                                                <span className="stat-value">
                                                    {(modelData.max_similarity * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="model-results-list">
                                            <h5>Топ-5 результатів:</h5>
                                            {modelData.results.map((result, index) => (
                                                <div key={result.id} className="model-result-item">
                                                    <span className="result-rank">#{index + 1}</span>
                                                    <div className="result-info">
                                                        <span className="result-name">{result.name}</span>
                                                        <span className={`result-type type-${result.type}`}>
                                                            {result.type === 'song' && '🎵'}
                                                            {result.type === 'single' && '💿'}
                                                            {result.type === 'album' && '📀'}
                                                        </span>
                                                    </div>
                                                    <div className="result-similarity-bar">
                                                        <div
                                                            className="similarity-fill"
                                                            style={{
                                                                width: `${result.similarity * 100}%`,
                                                                backgroundColor: getSimilarityColor(result.similarity)
                                                            }}
                                                        />
                                                        <span className="similarity-text">
                                                            {(result.similarity * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="model-tech-info">
                                            <small>Модель: {modelData.model_name}</small>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="comparison-tips">
                        <FaChartBar />
                        <div>
                            <h4>💡 Як інтерпретувати результати:</h4>
                            <ul>
                                <li><strong>Висока схожість (70-100%):</strong> Модель відмінно розуміє запит</li>
                                <li><strong>Середня схожість (50-70%):</strong> Модель знаходить схожі результати</li>
                                <li><strong>Низька схожість (&lt;50%):</strong> Модель погано підходить для цього типу запитів</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/*<div className="test-suggestions">*/}
            {/*    <h4>🧪 Рекомендовані тестові запити:</h4>*/}
            {/*    <div className="suggestion-buttons">*/}
            {/*        <button onClick={() => setQuery("сумна пісня про осінь")} className="suggestion-btn">*/}
            {/*            сумна пісня про осінь*/}
            {/*        </button>*/}
            {/*        <button onClick={() => setQuery("енергійний реп про життя")} className="suggestion-btn">*/}
            {/*            енергійний реп про життя*/}
            {/*        </button>*/}
            {/*        <button onClick={() => setQuery("романтична балада")} className="suggestion-btn">*/}
            {/*            романтична балада*/}
            {/*        </button>*/}
            {/*        <button onClick={() => setQuery("літо море відпочинок")} className="suggestion-btn">*/}
            {/*            літо море відпочинок*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default ModelComparison;