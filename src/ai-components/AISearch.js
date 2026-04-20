import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaRobot, FaTimes, FaDatabase, FaTrash, FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import '../styles/AISearch.css';

const AISearch = ({ onSelectItem, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiStatus, setAiStatus] = useState(null);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState("MiniLM");
    const [isChangingModel, setIsChangingModel] = useState(false);
    const [showStorageInfo, setShowStorageInfo] = useState(false);
    const [lastUpdateStats, setLastUpdateStats] = useState(null);

    // Стан для drag-and-drop
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const AI_API_URL = "http://localhost:5001/api/ai";
    const API_URL = "http://localhost:5000/api";

    useEffect(() => {
        checkAIStatus();
    }, []);

    // Drag handlers
    const handleMouseDown = (e) => {
        if (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'SELECT' ||
            e.target.closest('.search-form') ||
            e.target.closest('.results-list') ||
            e.target.closest('.close-button') ||
            e.target.closest('.storage-info-panel')) {
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
    }, [isDragging, dragStart]);

    const checkAIStatus = async () => {
        try {
            const response = await fetch(`${AI_API_URL}/status`);
            const data = await response.json();
            setAiStatus(data);

            // Встановлюємо поточну модель з сервера
            if (data.current_model) {
                const modelKey = Object.entries({
                    'LaBSE': 'sentence-transformers/LaBSE',
                    'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
                    'DistilUSE': 'distiluse-base-multilingual-cased-v2'
                }).find(([key, value]) => value === data.current_model)?.[0] || 'LaBSE';

                setSelectedModel(modelKey);
            }
        } catch (err) {
            console.error("AI сервіс недоступний:", err);
            setAiStatus({ status: 'offline' });
        }
    };

    const handleModelChange = async (e) => {
        const newModel = e.target.value;
        setSelectedModel(newModel);
        setIsChangingModel(true);

        try {
            const response = await fetch(`${AI_API_URL}/set-model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: newModel })
            });

            if (!response.ok) {
                throw new Error('Помилка зміни моделі');
            }

            const data = await response.json();
            console.log('✅ Модель змінено:', data);

            // Оновлюємо статус
            await checkAIStatus();

            // Показуємо повідомлення
            if (data.embeddings_created) {
                alert(`✅ ${data.message}\n💾 Створено ${data.embeddings_count} embeddings`);
            } else {
                alert(`✅ ${data.message}\n📂 Завантажено збережені embeddings (${data.embeddings_count})`);
            }

        } catch (err) {
            console.error('❌ Помилка зміни моделі:', err);
            alert('❌ Помилка зміни моделі: ' + err.message);

            // Повертаємо попередню модель
            if (aiStatus?.current_model) {
                const modelKey = Object.entries({
                    'LaBSE': 'sentence-transformers/LaBSE',
                    'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
                    'DistilUSE': 'distiluse-base-multilingual-cased-v2'
                }).find(([key, value]) => value === aiStatus.current_model)?.[0] || 'MiniLM';
                setSelectedModel(modelKey);
            }
        } finally {
            setIsChangingModel(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError("Введіть запит для пошуку");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${AI_API_URL}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query,
                    top_k: 10
                })
            });

            if (!response.ok) {
                throw new Error('Помилка пошуку');
            }

            const data = await response.json();
            setResults(data.results || []);

            if (data.results.length === 0) {
                setError("Нічого не знайдено. Спробуйте інший запит.");
            }
        } catch (err) {
            console.error("Помилка AI пошуку:", err);
            setError("Помилка з'єднання з AI сервісом. Перевірте чи запущений ai_search.py");
        } finally {
            setIsLoading(false);
        }
    };

    const rebuildEmbeddings = async (forceRebuild = false) => {
        const action = forceRebuild ? "повну перебудову" : "інкрементальне оновлення";

        if (forceRebuild) {
            if (!window.confirm('⚠️ Це видалить всі збережені embeddings та створить їх заново.\nПродовжити?')) {
                return;
            }
        }

        setIsLoading(true);
        setLastUpdateStats(null);

        try {
            const response = await fetch(`${AI_API_URL}/rebuild`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force: forceRebuild })
            });

            const data = await response.json();

            // Зберігаємо статистику оновлення
            setLastUpdateStats({
                message: data.message,
                count: data.count,
                timestamp: new Date().toLocaleTimeString()
            });

            alert(`✅ ${data.message}\n📦 Оброблено: ${data.count} елементів`);
            await checkAIStatus();
        } catch (err) {
            alert("❌ Помилка оновлення: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearCache = async (modelKey = 'all') => {
        const confirmMsg = modelKey === 'all'
            ? '⚠️ Видалити ВСІ збережені embeddings для всіх моделей?'
            : `⚠️ Видалити збережені embeddings для моделі ${modelKey}?`;

        if (!window.confirm(confirmMsg)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${AI_API_URL}/clear-cache`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelKey })
            });

            const data = await response.json();
            alert(`✅ ${data.message}\n🗑️ Видалено: ${data.deleted.join(', ')}`);
            await checkAIStatus();
        } catch (err) {
            alert("❌ Помилка очищення кешу: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setError(null);
    };

    const toggleStorageInfo = () => {
        setShowStorageInfo(!showStorageInfo);
    };

    return (
        <div
            ref={containerRef}
            className="ai-search-container"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="ai-search-header">
                <div className="ai-title">
                    <FaRobot className="ai-icon" />
                    <h2>AI Search</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Кнопка інфо про сховище */}
                    <button
                        className="icon-button"
                        onClick={toggleStorageInfo}
                        title="Інформація про сховище"
                        disabled={aiStatus?.status === 'offline'}
                    >
                        <FaInfoCircle />
                    </button>

                    {/* SELECT ДЛЯ ВИБОРУ МОДЕЛІ */}
                    <select
                        value={selectedModel}
                        onChange={handleModelChange}
                        disabled={isLoading || isChangingModel || aiStatus?.status === 'offline'}
                        className="model-select"
                        title="Вибрати AI модель"
                    >
                        <option value="LaBSE">LaBSE</option>
                        <option value="MiniLM">MiniLM ⚡</option>
                        <option value="DistilUSE">DistilUSE</option>
                    </select>

                    {aiStatus && (
                        <div className={`ai-status ${aiStatus.status}`}>
                            <div className="status-indicator"></div>
                            <span>{aiStatus.status === 'online' ? 'Online' : 'Offline'}</span>
                            {aiStatus.embeddings_count > 0 && (
                                <span className="embeddings-count">
                                    ({aiStatus.embeddings_count})
                                </span>
                            )}
                        </div>
                    )}
                    {onClose && (
                        <button className="close-button" onClick={onClose}>
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Панель інформації про сховище */}
            {showStorageInfo && aiStatus?.disk_storage && (
                <div className="storage-info-panel">
                    <h4>💾 Збережені Embeddings</h4>
                    <div className="storage-models-list">
                        {Object.entries(aiStatus.disk_storage).map(([modelName, info]) => {
                            const shortName = modelName.split('/').pop() || modelName;
                            const displayName =
                                modelName.includes('LaBSE') ? 'LaBSE' :
                                    modelName.includes('MiniLM') ? 'MiniLM' :
                                        modelName.includes('DistilUSE') ? 'DistilUSE' : shortName;

                            return (
                                <div key={modelName} className="storage-model-item">
                                    <div className="storage-model-header">
                                        <strong>{displayName}</strong>
                                        {info.exists && (
                                            <button
                                                className="mini-button delete"
                                                onClick={() => clearCache(displayName)}
                                                title="Видалити кеш цієї моделі"
                                                disabled={isLoading}
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        )}
                                    </div>
                                    {info.exists ? (
                                        <div className="storage-model-stats">
                                            <span>📦 {info.embeddings_count} embeddings</span>
                                            <span>💽 {info.size_mb} MB</span>
                                            <div className="storage-breakdown">
                                                <small>
                                                    Albums: {info.albums} |
                                                    Singles: {info.singles} |
                                                    Songs: {info.songs}
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="no-cache">Немає кешу</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {aiStatus.cache_directory && (
                        <div className="cache-directory">
                            <small>📁 {aiStatus.cache_directory}</small>
                        </div>
                    )}

                    <button
                        className="clear-all-cache-button"
                        onClick={() => clearCache('all')}
                        disabled={isLoading}
                    >
                        <FaTrash /> Очистити весь кеш
                    </button>
                </div>
            )}

            {/* Статистика останнього оновлення */}
            {lastUpdateStats && (
                <div className="update-stats">
                    <span className="update-time">{lastUpdateStats.timestamp}</span>
                    <span>{lastUpdateStats.message} ({lastUpdateStats.count} елементів)</span>
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Наприклад: пісня про літо..."
                        className="search-input"
                        disabled={isLoading || aiStatus?.status === 'offline'}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="clear-button"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="search-actions">
                    <button
                        type="submit"
                        className="search-button"
                        disabled={isLoading || !query.trim() || aiStatus?.status === 'offline'}
                    >
                        {isLoading ? 'Шукаю...' : 'Шукати'}
                    </button>

                    <div className="button-group">
                        <button
                            type="button"
                            onClick={() => rebuildEmbeddings(false)}
                            className="rebuild-button"
                            disabled={isLoading}
                            title="Інкрементальне оновлення (тільки змінені)"
                        >
                            <FaSyncAlt /> Оновити
                        </button>

                        <button
                            type="button"
                            onClick={() => rebuildEmbeddings(true)}
                            className="rebuild-button force"
                            disabled={isLoading}
                            title="Повна перебудова всіх embeddings"
                        >
                            <FaDatabase /> Перебудувати
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="search-error">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>
                        {isChangingModel ? 'Завантаження моделі...' : 'Аналізую базу...'}
                    </p>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="search-results">
                    <div className="results-header">
                        <h3>Результати: {results.length}</h3>
                        <p className="results-query">"{query}"</p>
                    </div>

                    <div className="results-list">
                        {results.map((result, index) => (
                            <div
                                key={result.id}
                                className="result-item"
                                onClick={() => onSelectItem && onSelectItem(result)}
                            >
                                <div className="result-rank">#{index + 1}</div>

                                <div className="result-content">
                                    <div className="result-header-row">
                                        <h4 className="result-title">
                                            {result.data.name}
                                        </h4>
                                        <span className={`result-type ${result.type}`}>
                                            {result.type === 'song' && '🎵 SONG'}
                                            {result.type === 'single' && '💿 SINGLE'}
                                            {result.type === 'album' && '💽 ALBUM'}
                                        </span>
                                    </div>

                                    {result.type === 'song' && result.data.albumName && (
                                        <p className="result-album">
                                            📀 Album: {result.data.albumName}
                                        </p>
                                    )}

                                    {result.data.creator && (
                                        <p className="result-creator">
                                            🎤 {result.data.creator || result.data.albumCreator}
                                        </p>
                                    )}

                                    {result.data.lyrics && (
                                        <p className="result-lyrics">
                                            {result.data.lyrics.substring(0, 100)}...
                                        </p>
                                    )}

                                    {result.data.description && (
                                        <p className="result-description">
                                            {result.data.description}
                                        </p>
                                    )}

                                    <div className="result-similarity">
                                        <div className="similarity-bar">
                                            <div
                                                className="similarity-fill"
                                                style={{
                                                    width: `${result.similarity * 100}%`,
                                                    backgroundColor: result.similarity > 0.7 ? '#4caf50' :
                                                        result.similarity > 0.5 ? '#ff9800' : '#f44336'
                                                }}
                                            />
                                        </div>
                                        <span className="similarity-score">
                                            Match: {(result.similarity * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                {result.data.coverImage && (
                                    <div
                                        className="result-cover"
                                        style={{
                                            backgroundImage: `url(${API_URL}/uploads/${result.data.coverImage})`
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AISearch;
//import React, { useState, useEffect, useRef } from 'react';
//import { FaSearch, FaRobot, FaTimes } from 'react-icons/fa';
//import '../styles/AISearch.css';

//const AISearch = ({ onSelectItem, onClose }) => {
//    const [query, setQuery] = useState('');
//    const [results, setResults] = useState([]);
//    const [isLoading, setIsLoading] = useState(false);
//    const [aiStatus, setAiStatus] = useState(null);
//    const [error, setError] = useState(null);
//    const [selectedModel, setSelectedModel] = useState("MiniLM");
//    const [isChangingModel, setIsChangingModel] = useState(false);


//    // Стан для drag-and-drop
//    const [isDragging, setIsDragging] = useState(false);
//    const [position, setPosition] = useState({ x: 0, y: 0 });
//    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//    const containerRef = useRef(null);

//    const AI_API_URL = "http://localhost:5001/api/ai";
//    const API_URL = "http://localhost:5000/api";

//    useEffect(() => {
//        checkAIStatus();
//    }, []);

//    // Drag handlers
//    const handleMouseDown = (e) => {
//        // Не починаємо drag якщо клікнули на input, button або інший інтерактивний елемент
//        if (e.target.tagName === 'INPUT' ||
//            e.target.tagName === 'BUTTON' ||
//            e.target.closest('.search-form') ||
//            e.target.closest('.results-list') ||
//            e.target.closest('.close-button')) {
//            return;
//        }

//        setIsDragging(true);
//        setDragStart({
//            x: e.clientX - position.x,
//            y: e.clientY - position.y
//        });
//    };

//    const handleMouseMove = (e) => {
//        if (!isDragging) return;

//        setPosition({
//            x: e.clientX - dragStart.x,
//            y: e.clientY - dragStart.y
//        });
//    };

//    const handleMouseUp = () => {
//        setIsDragging(false);
//    };

//    useEffect(() => {
//        if (isDragging) {
//            document.addEventListener('mousemove', handleMouseMove);
//            document.addEventListener('mouseup', handleMouseUp);

//            return () => {
//                document.removeEventListener('mousemove', handleMouseMove);
//                document.removeEventListener('mouseup', handleMouseUp);
//            };
//        }
//    }, [isDragging, dragStart]);

//    const checkAIStatus = async () => {
//        try {
//            const response = await fetch(`${AI_API_URL}/status`);
//            const data = await response.json();
//            setAiStatus(data);

//            // Встановлюємо поточну модель з сервера
//            if (data.current_model) {
//                const modelKey = Object.entries({
//                    'LaBSE': 'sentence-transformers/LaBSE',
//                    'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
//                    'DistilUSE': 'distiluse-base-multilingual-cased-v2'
//                }).find(([key, value]) => value === data.current_model)?.[0] || 'LaBSE';

//                setSelectedModel(modelKey);
//            }
//        } catch (err) {
//            console.error("AI сервіс недоступний:", err);
//            setAiStatus({ status: 'offline' });
//        }
//    };

//    const handleModelChange = async (e) => {
//        const newModel = e.target.value;
//        setSelectedModel(newModel);
//        setIsChangingModel(true);

//        try {
//            const response = await fetch(`${AI_API_URL}/set-model`, {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json' },
//                body: JSON.stringify({ model: newModel })
//            });

//            if (!response.ok) {
//                throw new Error('Помилка зміни моделі');
//            }

//            const data = await response.json();
//            console.log('✅ Модель змінено:', data);

//            // Оновлюємо статус
//            await checkAIStatus();

//            // Показуємо повідомлення
//            if (data.embeddings_created) {
//                alert(`✅ ${data.message}\nСтворено ${data.embeddings_count} embeddings`);
//            } else {
//                alert(`✅ ${data.message}\nВикористано збережені embeddings (${data.embeddings_count})`);
//            }

//        } catch (err) {
//            console.error('❌ Помилка зміни моделі:', err);
//            alert('❌ Помилка зміни моделі: ' + err.message);

//            // Повертаємо попередню модель
//            if (aiStatus?.current_model) {
//                const modelKey = Object.entries({
//                    'LaBSE': 'sentence-transformers/LaBSE',
//                    'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
//                    'DistilUSE': 'distiluse-base-multilingual-cased-v2'
//                }).find(([key, value]) => value === aiStatus.current_model)?.[0] || 'MiniLM';
//                setSelectedModel(modelKey);
//            }
//        } finally {
//            setIsChangingModel(false);
//        }
//    };

//    const handleSearch = async (e) => {
//        e.preventDefault();

//        if (!query.trim()) {
//            setError("Введіть запит для пошуку");
//            return;
//        }

//        setIsLoading(true);
//        setError(null);

//        try {
//            const response = await fetch(`${AI_API_URL}/search`, {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json' },
//                body: JSON.stringify({
//                    query: query,
//                    top_k: 10
//                })
//            });

//            if (!response.ok) {
//                throw new Error('Помилка пошуку');
//            }

//            const data = await response.json();
//            setResults(data.results || []);

//            if (data.results.length === 0) {
//                setError("Нічого не знайдено. Спробуйте інший запит.");
//            }
//        } catch (err) {
//            console.error("Помилка AI пошуку:", err);
//            setError("Помилка з'єднання з AI сервісом. Перевірте чи запущений ai_search.py");
//        } finally {
//            setIsLoading(false);
//        }
//    };

//    const rebuildEmbeddings = async () => {
//        setIsLoading(true);
//        try {
//            const response = await fetch(`${AI_API_URL}/rebuild`, {
//                method: 'POST'
//            });
//            const data = await response.json();
//            alert(`✅ ${data.message}\nОброблено: ${data.count} елементів`);
//            checkAIStatus();
//        } catch (err) {
//            alert("❌ Помилка оновлення: " + err.message);
//        } finally {
//            setIsLoading(false);
//        }
//    };

//    const clearSearch = () => {
//        setQuery('');
//        setResults([]);
//        setError(null);
//    };

//    return (
//        <div
//            ref={containerRef}
//            className="ai-search-container"
//            style={{
//                transform: `translate(${position.x}px, ${position.y}px)`,
//                cursor: isDragging ? 'grabbing' : 'default'
//            }}
//            onMouseDown={handleMouseDown}
//        >
//            <div className="ai-search-header">
//                <div className="ai-title">
//                    <FaRobot className="ai-icon" />
//                    <h2>AI Search</h2>
//                </div>

//                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                    {/* SELECT ДЛЯ ВИБОРУ МОДЕЛІ */}
//                    <select
//                        value={selectedModel}
//                        onChange={handleModelChange}
//                        disabled={isLoading || isChangingModel || aiStatus?.status === 'offline'}
//                        className="model-select"
//                        title="Вибрати AI модель"
//                    >
//                        <option value="LaBSE">LaBSE</option>
//                        <option value="MiniLM">MiniLM</option>
//                        <option value="DistilUSE">DistilUSE</option>
//                    </select>

//                    {aiStatus && (
//                        <div className={`ai-status ${aiStatus.status}`}>
//                            <div className="status-indicator"></div>
//                            <span>{aiStatus.status === 'online' ? 'Online' : 'Offline'}</span>
//                            {aiStatus.embeddings_count > 0 && (
//                                <span className="embeddings-count">
//                                    ({aiStatus.embeddings_count})
//                                </span>
//                            )}
//                        </div>
//                    )}
//                    {onClose && (
//                        <button className="close-button" onClick={onClose}>
//                            ×
//                        </button>
//                    )}
//                </div>
//            </div>

//            <form onSubmit={handleSearch} className="search-form">
//                <div className="search-input-wrapper">
//                    <FaSearch className="search-icon" />
//                    <input
//                        type="text"
//                        value={query}
//                        onChange={(e) => setQuery(e.target.value)}
//                        placeholder="Пошук музики..."
//                        className="search-input"
//                        disabled={isLoading || aiStatus?.status === 'offline'}
//                    />
//                    {query && (
//                        <button
//                            type="button"
//                            onClick={clearSearch}
//                            className="clear-button"
//                        >
//                            <FaTimes />
//                        </button>
//                    )}
//                </div>

//                <div className="search-actions">
//                    <button
//                        type="submit"
//                        className="search-button"
//                        disabled={isLoading || !query.trim() || aiStatus?.status === 'offline'}
//                    >
//                        {isLoading ? 'Шукаю...' : 'Шукати'}
//                    </button>

//                    <button
//                        type="button"
//                        onClick={rebuildEmbeddings}
//                        className="rebuild-button"
//                        disabled={isLoading}
//                        title="Оновити AI індекс"
//                    >
//                        Оновити
//                    </button>
//                </div>
//            </form>

//            {error && (
//                <div className="search-error">
//                    {error}
//                </div>
//            )}

//            {isLoading && (
//                <div className="loading-spinner">
//                    <div className="spinner"></div>
//                    <p>Аналізую базу...</p>
//                </div>
//            )}

//            {!isLoading && results.length > 0 && (
//                <div className="search-results">
//                    <div className="results-header">
//                        <h3>Результати: {results.length}</h3>
//                        <p className="results-query">"{query}"</p>
//                    </div>

//                    <div className="results-list">
//                        {results.map((result, index) => (
//                            <div
//                                key={result.id}
//                                className="result-item"
//                                onClick={() => onSelectItem && onSelectItem(result)}
//                            >
//                                <div className="result-rank">#{index + 1}</div>

//                                <div className="result-content">
//                                    <div className="result-header-row">
//                                        <h4 className="result-title">
//                                            {result.data.name}
//                                        </h4>
//                                        <span className="result-type">
//                                            {result.type === 'song' && 'SONG'}
//                                            {result.type === 'single' && 'SINGLE'}
//                                            {result.type === 'album' && 'ALBUM'}
//                                        </span>
//                                    </div>

//                                    {result.type === 'song' && result.data.albumName && (
//                                        <p className="result-album">
//                                            Album: {result.data.albumName}
//                                        </p>
//                                    )}

//                                    {result.data.lyrics && (
//                                        <p className="result-lyrics">
//                                            {result.data.lyrics.substring(0, 100)}...
//                                        </p>
//                                    )}

//                                    {result.data.description && (
//                                        <p className="result-description">
//                                            {result.data.description}
//                                        </p>
//                                    )}

//                                    <div className="result-similarity">
//                                        <div className="similarity-bar">
//                                            <div
//                                                className="similarity-fill"
//                                                style={{ width: `${result.similarity * 100}%` }}
//                                            />
//                                        </div>
//                                        <span className="similarity-score">
//                                            Match: {(result.similarity * 100).toFixed(0)}%
//                                        </span>
//                                    </div>
//                                </div>

//                                {result.data.coverImage && (
//                                    <div
//                                        className="result-cover"
//                                        style={{
//                                            backgroundImage: `url(${API_URL}/uploads/${result.data.coverImage})`
//                                        }}
//                                    />
//                                )}
//                            </div>
//                        ))}
//                    </div>
//                </div>
//            )}

//            {/*<div className="ai-hints">*/}
//            {/*    <h4>Quick Search:</h4>*/}
//            {/*    <div className="hints-list">*/}
//            {/*        <button type="button" onClick={() => setQuery("сумна пісня про розлучення")} className="hint-button">*/}
//            {/*            сумна пісня*/}
//            {/*        </button>*/}
//            {/*        <button type="button" onClick={() => setQuery("реп про життя")} className="hint-button">*/}
//            {/*            реп про життя*/}
//            {/*        </button>*/}
//            {/*        <button type="button" onClick={() => setQuery("літня музика")} className="hint-button">*/}
//            {/*            літня музика*/}
//            {/*        </button>*/}
//            {/*        <button type="button" onClick={() => setQuery("романтика")} className="hint-button">*/}
//            {/*            романтика*/}
//            {/*        </button>*/}
//            {/*    </div>*/}
//            {/*</div>*/}
//        </div>
//    );
//};

//export default AISearch;