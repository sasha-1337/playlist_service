from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import requests
import pickle
import os
import hashlib
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Директорія для зберігання embeddings
CACHE_DIR = "embeddings_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Завантажуємо модель за замовчуванням
print("📦 Завантаження моделі Sentence Transformers...")
current_model_name = 'paraphrase-multilingual-MiniLM-L12-v2'
model = SentenceTransformer(current_model_name)
print(f"✅ Модель завантажено: {current_model_name}")

# Кеш для embeddings - буде завантажено з диску
embeddings_cache = {
    'sentence-transformers/LaBSE': {'album': {}, 'single': {}, 'song': {}},
    'paraphrase-multilingual-MiniLM-L12-v2': {'album': {}, 'single': {}, 'song': {}},
    'distiluse-base-multilingual-cased-v2': {'album': {}, 'single': {}, 'song': {}}
}

def get_cache_path(model_name):
    """Повертає шлях до файлу кешу для моделі"""
    safe_name = model_name.replace('/', '_').replace('-', '_')
    return os.path.join(CACHE_DIR, f"{safe_name}.pkl")

def get_hash_path():
    """Повертає шлях до файлу з хешами даних"""
    return os.path.join(CACHE_DIR, "data_hashes.pkl")

def load_cache_from_disk(model_name):
    """Завантажує кеш для моделі з диску"""
    cache_path = get_cache_path(model_name)
    
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'rb') as f:
                cache = pickle.load(f)
            
            total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
            print(f"📂 Завантажено {total} embeddings для {model_name}")
            return cache
        except Exception as e:
            print(f"⚠️ Помилка завантаження кешу для {model_name}: {e}")
    
    return {'album': {}, 'single': {}, 'song': {}}

def save_cache_to_disk(model_name, cache):
    """Зберігає кеш для моделі на диск"""
    cache_path = get_cache_path(model_name)
    
    try:
        with open(cache_path, 'wb') as f:
            pickle.dump(cache, f, protocol=pickle.HIGHEST_PROTOCOL)
        
        total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
        print(f"💾 Збережено {total} embeddings для {model_name}")
        return True
    except Exception as e:
        print(f"❌ Помилка збереження кешу для {model_name}: {e}")
        return False

def load_data_hashes():
    """Завантажує збережені хеші даних"""
    hash_path = get_hash_path()
    
    if os.path.exists(hash_path):
        try:
            with open(hash_path, 'rb') as f:
                return pickle.load(f)
        except Exception as e:
            print(f"⚠️ Помилка завантаження хешів: {e}")
    
    return {}

def save_data_hashes(hashes):
    """Зберігає хеші даних"""
    hash_path = get_hash_path()
    
    try:
        with open(hash_path, 'wb') as f:
            pickle.dump(hashes, f, protocol=pickle.HIGHEST_PROTOCOL)
        return True
    except Exception as e:
        print(f"❌ Помилка збереження хешів: {e}")
        return False

def compute_item_hash(item, item_type):
    """Обчислює хеш для елемента для відстеження змін"""
    if item_type == 'song':
        # Для пісні враховуємо всі релевантні поля
        hash_data = f"{item.get('name', '')}{item.get('lyrics', '')}{item.get('description', '')}"
        hash_data += f"{item.get('album_creator', '')}{item.get('album_name', '')}{item.get('album_genre', '')}"
    elif item_type == 'single':
        hash_data = f"{item.get('creator', '')}{item.get('name', '')}{item.get('genre', '')}"
        hash_data += f"{item.get('description', '')}{item.get('lyrics', '')}"
    elif item_type == 'album':
        hash_data = f"{item.get('creator', '')}{item.get('name', '')}{item.get('genre', '')}"
        hash_data += f"{item.get('description', '')}"
        # Додаємо пісні
        for song in item.get('songs', []):
            hash_data += f"{song.get('name', '')}{song.get('lyrics', '')}"
    else:
        hash_data = ""
    
    return hashlib.md5(hash_data.encode('utf-8')).hexdigest()

def get_current_cache():
    """Повертає кеш для поточної моделі"""
    global current_model_name, embeddings_cache
    
    if current_model_name not in embeddings_cache:
        embeddings_cache[current_model_name] = load_cache_from_disk(current_model_name)
    
    return embeddings_cache[current_model_name]

def get_text_for_embedding(item, item_type):
    """Створює текстовий опис для векторизації"""
    if item_type == 'song':
        parts = [
            f"Song creator: {item.get('album_creator', '')}. " if item.get('album_creator') else '',
            f"Song name: {item.get('name', '')}. ",
            f"Song from album: {item.get('album_name', '')}. " if item.get('album_name') else '',
            f"Song genre: {item.get('album_genre', '')}. " if item.get('album_genre') else '',
            f"Song lyrics: {item.get('lyrics', '')}. ",
            f"Song description: {item.get('description', '')}. "
        ]
    elif item_type == 'single':
        parts = [
            f"Single creator: {item.get('creator', '')}. ",
            f"Single name: {item.get('name', '')}. ",
            f"Single genre: {item.get('genre', '')}. ",
            f"Single description: {item.get('description', '')}. ",
            f"Single lyrics: {item.get('lyrics', '')}. "
        ]
    elif item_type == 'album':
        parts = [
            f"Album creator: {item.get('creator', '')}. ",
            f"Album name: {item.get('name', '')}. ",
            f"Album genre: {item.get('genre', '')}. ",
            f"Album description: {item.get('description', '')}. ",
        ]
    else:
        parts = []
    
    text = ' '.join([p for p in parts if p]).strip()
    text = ' '.join(text.split())
    
    return text if text else "empty"

def fetch_music_data():
    """Отримує дані з основного Node.js API"""
    try:
        response = requests.get('http://localhost:5000/api/items', timeout=5)
        data = response.json()
        return data
    except Exception as e:
        print(f"❌ Помилка при отриманні даних: {e}")
        return {'albums': [], 'singles': []}

def build_embeddings(force_rebuild=False):
    """Створює embeddings для всієї бази (інкрементальне оновлення)"""
    global current_model_name, model, embeddings_cache
    
    print(f"\n🔄 {'Повна перебудова' if force_rebuild else 'Інкрементальне оновлення'} embeddings для {current_model_name}...")
    
    # Завантажуємо кеш з диску якщо його немає в пам'яті
    if current_model_name not in embeddings_cache or not embeddings_cache[current_model_name]:
        embeddings_cache[current_model_name] = load_cache_from_disk(current_model_name)
    
    cache = embeddings_cache[current_model_name]
    
    # Завантажуємо попередні хеші
    old_hashes = load_data_hashes()
    new_hashes = {}
    
    data = fetch_music_data()
    
    if not data.get('albums') and not data.get('singles'):
        print("⚠️ База даних порожня")
        return 0
    
    # Лічільники для статистики оновлення даних
    items_to_process = []
    items_updated = 0
    items_unchanged = 0
    items_deleted = 0
    
    # Множини для відстеження існуючих ID
    current_album_ids = set()
    current_single_ids = set()
    current_song_ids = set()
    
    # --- Обробка альбомів ---
    for album in data.get('albums', []):
        try:
            album_id = str(album.get('_id', album.get('id', '')))
            if not album_id:
                continue
            
            current_album_ids.add(album_id)
            album_hash = compute_item_hash(album, 'album')
            new_hashes[f"album_{album_id}"] = album_hash
            
            # Перевіряємо чи змінився альбом
            old_hash = old_hashes.get(f"album_{album_id}")
            
            if not force_rebuild and old_hash == album_hash and album_id in cache['album']:
                items_unchanged += 1
            else:
                album_text = get_text_for_embedding(album, 'album')
                items_to_process.append({
                    'id': album_id,
                    'type': 'album',
                    'text': album_text,
                    'data': album
                })
                items_updated += 1
            
            # --- Обробка пісень в альбомі ---
            for song in album.get('songs', []):
                try:
                    song_data = {
                        **song,
                        'album_creator': album.get('creator', ''),
                        'album_name': album.get('name', ''),
                        'album_genre': album.get('genre', ''),
                        'album_description': album.get('description', '')
                    }
                    song_id = str(song.get('_id', ''))
                    if not song_id:
                        continue
                    
                    composite_id = f"{album_id}_{song_id}"
                    current_song_ids.add(composite_id)
                    
                    song_hash = compute_item_hash(song_data, 'song')
                    new_hashes[f"song_{composite_id}"] = song_hash
                    
                    old_hash = old_hashes.get(f"song_{composite_id}")
                    
                    if not force_rebuild and old_hash == song_hash and composite_id in cache['song']:
                        items_unchanged += 1
                    else:
                        song_text = get_text_for_embedding(song_data, 'song')
                        items_to_process.append({
                            'id': composite_id,
                            'type': 'song',
                            'text': song_text,
                            'data': {
                                **song,
                                'albumId': album_id,
                                'albumCreator': album.get('creator'),
                                'albumName': album.get('name'),
                                'albumGenre': album.get('genre'),
                                'albumDescription': album.get('description')
                            }
                        })
                        items_updated += 1
                        
                except Exception as e:
                    print(f"⚠️ Помилка обробки пісні: {e}")
                    continue
                    
        except Exception as e:
            print(f"⚠️ Помилка обробки альбому: {e}")
            continue
    
    # --- Обробка синглів ---
    for single in data.get('singles', []):
        try:
            single_id = str(single.get('_id', single.get('id', '')))
            if not single_id:
                continue
            
            current_single_ids.add(single_id)
            single_hash = compute_item_hash(single, 'single')
            new_hashes[f"single_{single_id}"] = single_hash
            
            old_hash = old_hashes.get(f"single_{single_id}")
            
            if not force_rebuild and old_hash == single_hash and single_id in cache['single']:
                items_unchanged += 1
            else:
                single_text = get_text_for_embedding(single, 'single')
                items_to_process.append({
                    'id': single_id,
                    'type': 'single',
                    'text': single_text,
                    'data': single
                })
                items_updated += 1
                
        except Exception as e:
            print(f"⚠️ Помилка обробки синглу: {e}")
            continue
    
    # --- Видалення старих embeddings ---
    for album_id in list(cache['album'].keys()):
        if album_id not in current_album_ids:
            del cache['album'][album_id]
            items_deleted += 1
            print(f"🗑️ Видалено альбом: {album_id}")
    
    for single_id in list(cache['single'].keys()):
        if single_id not in current_single_ids:
            del cache['single'][single_id]
            items_deleted += 1
            print(f"🗑️ Видалено сингл: {single_id}")
    
    for song_id in list(cache['song'].keys()):
        if song_id not in current_song_ids:
            del cache['song'][song_id]
            items_deleted += 1
            print(f"🗑️ Видалено пісню: {song_id}")
    
    # --- Створення нових embeddings ---
    if items_to_process:
        print(f"🔄 Створення embeddings для {len(items_to_process)} змінених елементів...")
        texts = [item['text'] for item in items_to_process]
        
        try:
            embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True, batch_size=8)
            
            for item, embedding in zip(items_to_process, embeddings):
                cache[item['type']][item['id']] = {
                    'embedding': embedding,
                    'data': item['data'],
                    'text': item['text']
                }
            
            print(f"✅ Створено {len(items_to_process)} нових embeddings")
            
        except Exception as e:
            print(f"❌ Помилка створення embeddings: {e}")
            import traceback
            traceback.print_exc()
    
    # --- Збереження на диск ---
    save_cache_to_disk(current_model_name, cache)
    save_data_hashes(new_hashes)
    
    total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
    
    print(f"\n📊 Статистика оновлення:")
    print(f"   ✅ Оновлено: {items_updated}")
    print(f"   ⏭️  Без змін: {items_unchanged}")
    print(f"   🗑️ Видалено: {items_deleted}")
    print(f"   📦 Всього в кеші: {total}")
    print(f"      - Альбоми: {len(cache['album'])}")
    print(f"      - Сингли: {len(cache['single'])}")
    print(f"      - Пісні: {len(cache['song'])}")
    
    return total

@app.route('/api/ai/search', methods=['POST'])
def ai_search():
    """Семантичний пошук"""
    global current_model_name, model
    
    try:
        query = request.json.get('query', '').strip()
        top_k = request.json.get('top_k', 10)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        cache = get_current_cache()
        
        # Нормалізуємо запит
        normalized_query = query
        if not any(word in query.lower() for word in ['пісня', 'сингл', 'альбом', 'трек', 'музика']):
            normalized_query = f"пісня про {query}"
        
        print(f"🔍 Пошук: '{query}' (модель: {current_model_name})")
        
        total_items = sum(len(cache[key]) for key in ['album', 'single', 'song'])
        if total_items == 0:
            print("⚠️ Кеш порожній, створюємо embeddings...")
            build_embeddings()
            cache = get_current_cache()
            total_items = sum(len(cache[key]) for key in ['album', 'single', 'song'])
            
        if total_items == 0:
            return jsonify({
                'query': query,
                'results': [],
                'total_searched': 0,
                'message': 'База даних порожня'
            })
        
        query_embedding = model.encode([normalized_query], convert_to_numpy=True)[0]
        
        all_items = []
        for item_type in ['album', 'single', 'song']:
            for item_id, item_data in cache[item_type].items():
                all_items.append({
                    'id': item_id,
                    'type': item_type,
                    'embedding': item_data['embedding'],
                    'data': item_data['data'],
                    'text': item_data['text']
                })
        
        if not all_items:
            return jsonify({'query': query, 'results': [], 'total_searched': 0})
        
        embeddings_matrix = np.array([item['embedding'] for item in all_items])
        similarities = cosine_similarity([query_embedding], embeddings_matrix)[0]
        
        # Бонус за збіг слів
        for idx, item in enumerate(all_items):
            query_words = set(query.lower().split())
            name = item['data'].get('name', '').lower()
            name_words = set(name.split())
            
            matching_words = query_words & name_words
            if matching_words:
                word_bonus = len(matching_words) * 0.15
                similarities[idx] = min(1.0, similarities[idx] + word_bonus)
        
        results = []
        for idx, similarity in enumerate(similarities):
            results.append({
                **all_items[idx],
                'similarity': float(similarity)
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        results = results[:top_k]
        
        formatted_results = []
        for item in results:
            formatted_results.append({
                'id': item['id'],
                'type': item['type'],
                'similarity': item['similarity'],
                'data': item['data']
            })
        
        return jsonify({
            'query': query,
            'normalized_query': normalized_query,
            'model': current_model_name,
            'results': formatted_results,
            'total_searched': len(all_items)
        })
        
    except Exception as e:
        print(f"❌ Помилка пошуку: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/test-models', methods=['POST'])
def test_models():
    """Порівняння різних моделей для одного запиту"""
    try:
        query = request.json.get('query', 'пісня про літо')
        top_k = request.json.get('top_k', 5)
        
        print(f"\n🧪 Тестування моделей для запиту: '{query}'")
        
        models_to_test = {
            'LaBSE': 'sentence-transformers/LaBSE',
            'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
            'DistilUSE': 'distiluse-base-multilingual-cased-v2'
        }
        
        data = fetch_music_data()
        
        all_items = []
        for album in data.get('albums', []):
            album_id = str(album.get('_id', album.get('id', '')))
            if album_id:
                all_items.append({
                    'id': album_id,
                    'type': 'album',
                    'name': album.get('name', ''),
                    'text': get_text_for_embedding(album, 'album'),
                    'data': album
                })
                
            for song in album.get('songs', []):
                song_id = str(song.get('_id', ''))
                if song_id:
                    song_data = {
                        **song,
                        'album_name': album.get('name', ''),
                        'album_description': album.get('description', '')
                    }
                    all_items.append({
                        'id': f"{album_id}_{song_id}",
                        'type': 'song',
                        'name': song.get('name', ''),
                        'text': get_text_for_embedding(song_data, 'song'),
                        'data': {**song, 'albumId': album_id, 'albumName': album.get('name')}
                    })
        
        for single in data.get('singles', []):
            single_id = str(single.get('_id', single.get('id', '')))
            if single_id:
                all_items.append({
                    'id': single_id,
                    'type': 'single',
                    'name': single.get('name', ''),
                    'text': get_text_for_embedding(single, 'single'),
                    'data': single
                })
        
        if not all_items:
            return jsonify({'error': 'База даних порожня'}), 400
        
        normalized_query = query
        if not any(word in query.lower() for word in ['пісня', 'сингл', 'альбом', 'трек', 'музика']):
            normalized_query = f"пісня про {query}"
        
        comparison_results = {}
        
        for model_display_name, model_name in models_to_test.items():
            print(f"\n  📦 Тестування {model_display_name}...")
            
            try:
                test_model = SentenceTransformer(model_name)
                
                texts = [item['text'] for item in all_items]
                item_embeddings = test_model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                
                query_embedding = test_model.encode([normalized_query], convert_to_numpy=True)[0]
                
                similarities = cosine_similarity([query_embedding], item_embeddings)[0]
                
                query_words = set(query.lower().split())
                for idx, item in enumerate(all_items):
                    name = item['name'].lower()
                    name_words = set(name.split())
                    matching_words = query_words & name_words
                    
                    if matching_words:
                        word_bonus = len(matching_words) * 0.15
                        similarities[idx] = min(1.0, similarities[idx] + word_bonus)
                
                results = []
                for idx, similarity in enumerate(similarities):
                    results.append({
                        'id': all_items[idx]['id'],
                        'type': all_items[idx]['type'],
                        'name': all_items[idx]['name'],
                        'similarity': float(similarity),
                        'data': all_items[idx]['data']
                    })
                
                results.sort(key=lambda x: x['similarity'], reverse=True)
                top_results = results[:top_k]
                
                comparison_results[model_display_name] = {
                    'model_name': model_name,
                    'results': top_results,
                    'avg_similarity': float(np.mean([r['similarity'] for r in top_results])),
                    'max_similarity': float(max([r['similarity'] for r in top_results])) if top_results else 0
                }
                
                print(f"    ✅ {model_display_name}: avg={comparison_results[model_display_name]['avg_similarity']:.3f}")
                
            except Exception as e:
                print(f"    ❌ Помилка з {model_display_name}: {e}")
                comparison_results[model_display_name] = {
                    'error': str(e),
                    'results': []
                }
        
        best_model = max(
            [name for name in comparison_results if 'error' not in comparison_results[name]],
            key=lambda x: comparison_results[x]['avg_similarity'],
            default=None
        )
        
        return jsonify({
            'query': query,
            'normalized_query': normalized_query,
            'comparison': comparison_results,
            'best_model': best_model,
            'recommendation': f"Рекомендую використовувати {best_model} для найкращої якості" if best_model else "Не вдалося визначити найкращу модель"
        })
        
    except Exception as e:
        print(f"❌ Помилка тестування моделей: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/set-model', methods=['POST'])
def set_model():
    """Змінює активну AI модель"""
    global model, current_model_name
    
    try:
        data = request.get_json()
        model_key = data.get('model', 'LaBSE')
        
        models_map = {
            'LaBSE': 'sentence-transformers/LaBSE',
            'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
            'DistilUSE': 'distiluse-base-multilingual-cased-v2'
        }
        
        if model_key not in models_map:
            return jsonify({'error': 'Невідома модель'}), 400
        
        model_name = models_map[model_key]
        
        if model_name == current_model_name:
            cache = get_current_cache()
            total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
            return jsonify({
                'message': f'Модель {model_key} вже активна',
                'model': model_name,
                'embeddings_count': total
            })
        
        print(f"\n🔄 Зміна моделі: {current_model_name} → {model_name}")
        
        print(f"📦 Завантаження {model_key}...")
        model = SentenceTransformer(model_name)
        current_model_name = model_name
        
        # Завантажуємо кеш з диску
        embeddings_cache[current_model_name] = load_cache_from_disk(current_model_name)
        cache = embeddings_cache[current_model_name]
        total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
        
        count = total
        if total == 0:
            print(f"⚠️ Немає embeddings для {model_key}, створюємо...")
            count = build_embeddings()
            print(f"✅ Створено {count} embeddings")
        else:
            print(f"✅ Завантажено існуючі embeddings ({total} елементів)")
        
        return jsonify({
            'message': f'Модель успішно змінено на {model_key}',
            'model': model_name,
            'embeddings_count': count,
            'embeddings_created': total == 0
        })
        
    except Exception as e:
        print(f"❌ Помилка зміни моделі: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/rebuild', methods=['POST'])
def rebuild_embeddings():
    """Повна перебудова embeddings"""
    try:
        force = request.json.get('force', False) if request.json else False
        count = build_embeddings(force_rebuild=force)
        return jsonify({
            'message': 'Embeddings оновлено' if not force else 'Embeddings повністю перебудовано',
            'count': count
        })
    except Exception as e:
        print(f"❌ Помилка rebuild: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/status', methods=['GET'])
def status():
    """Статус AI сервісу"""
    cache = get_current_cache()
    total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
    
    # Перевіряємо файли на диску
    disk_stats = {}
    for model_name in ['sentence-transformers/LaBSE', 'paraphrase-multilingual-MiniLM-L12-v2', 'distiluse-base-multilingual-cased-v2']:
        cache_path = get_cache_path(model_name)
        if os.path.exists(cache_path):
            file_size = os.path.getsize(cache_path)
            disk_cache = load_cache_from_disk(model_name)
            model_total = sum(len(disk_cache[key]) for key in ['album', 'single', 'song'])
            
            disk_stats[model_name] = {
                'exists': True,
                'size_mb': round(file_size / (1024 * 1024), 2),
                'embeddings_count': model_total,
                'albums': len(disk_cache['album']),
                'singles': len(disk_cache['single']),
                'songs': len(disk_cache['song'])
            }
        else:
            disk_stats[model_name] = {
                'exists': False,
                'size_mb': 0,
                'embeddings_count': 0
            }
    
    return jsonify({
        'status': 'online',
        'current_model': current_model_name,
        'embeddings_count': total,
        'cache': {
            'albums': len(cache['album']),
            'singles': len(cache['single']),
            'songs': len(cache['song'])
        },
        'disk_storage': disk_stats,
        'cache_directory': CACHE_DIR
    })

@app.route('/api/ai/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'healthy'})

@app.route('/api/ai/clear-cache', methods=['POST'])
def clear_cache():
    """Очищає кеш для вказаної моделі або всі кеші"""
    try:
        data = request.get_json()
        model_key = data.get('model', 'all') if data else 'all'
        
        models_map = {
            'LaBSE': 'sentence-transformers/LaBSE',
            'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
            'DistilUSE': 'distiluse-base-multilingual-cased-v2',
            'all': 'all'
        }
        
        deleted_files = []
        
        if model_key == 'all':
            # Видаляємо всі файли кешу
            for model_name in ['sentence-transformers/LaBSE', 'paraphrase-multilingual-MiniLM-L12-v2', 'distiluse-base-multilingual-cased-v2']:
                cache_path = get_cache_path(model_name)
                if os.path.exists(cache_path):
                    os.remove(cache_path)
                    deleted_files.append(model_name)
                    embeddings_cache[model_name] = {'album': {}, 'single': {}, 'song': {}}
            
            # Видаляємо хеші
            hash_path = get_hash_path()
            if os.path.exists(hash_path):
                os.remove(hash_path)
                deleted_files.append('data_hashes')
            
            return jsonify({
                'message': 'Весь кеш очищено',
                'deleted': deleted_files
            })
        else:
            if model_key not in models_map:
                return jsonify({'error': 'Невідома модель'}), 400
            
            model_name = models_map[model_key]
            cache_path = get_cache_path(model_name)
            
            if os.path.exists(cache_path):
                os.remove(cache_path)
                deleted_files.append(model_name)
                embeddings_cache[model_name] = {'album': {}, 'single': {}, 'song': {}}
                
                return jsonify({
                    'message': f'Кеш для {model_key} очищено',
                    'deleted': deleted_files
                })
            else:
                return jsonify({
                    'message': f'Кеш для {model_key} не існує',
                    'deleted': []
                })
                
    except Exception as e:
        print(f"❌ Помилка очищення кешу: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🤖 Запуск AI Search Service...")
    print(f"📦 Поточна модель: {current_model_name}")
    print(f"💾 Директорія кешу: {CACHE_DIR}")
    
    # Завантажуємо існуючий кеш або створюємо новий
    try:
        embeddings_cache[current_model_name] = load_cache_from_disk(current_model_name)
        cache = embeddings_cache[current_model_name]
        total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
        
        if total > 0:
            print(f"✅ Завантажено {total} embeddings з диску")
            print(f"   - Альбоми: {len(cache['album'])}")
            print(f"   - Сингли: {len(cache['single'])}")
            print(f"   - Пісні: {len(cache['song'])}")
            
            # Перевіряємо чи потрібно оновлення
            print(f"\n🔄 Перевірка змін у базі даних...")
            build_embeddings()
        else:
            print(f"⚠️ Кеш порожній, створюємо embeddings...")
            build_embeddings()
            
    except Exception as e:
        print(f"⚠️ Помилка ініціалізації: {e}")
        print(f"🔄 Створюємо новий кеш...")
        try:
            build_embeddings()
        except Exception as e2:
            print(f"❌ Критична помилка: {e2}")
    
    print("\n✅ Готово! http://localhost:5001")
    print(f"📌 Доступні моделі: LaBSE, MiniLM, DistilUSE")
    print(f"💡 Embeddings зберігаються в {CACHE_DIR} та завантажуються автоматично")
    
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from sentence_transformers import SentenceTransformer
# import numpy as np
# from sklearn.metrics.pairwise import cosine_similarity
# import requests

# app = Flask(__name__)
# CORS(app)

# # Завантажуємо модель за замовчуванням
# print("📦 Завантаження моделі Sentence Transformers...")
# current_model_name = 'paraphrase-multilingual-MiniLM-L12-v2'
# model = SentenceTransformer(current_model_name)
# print(f"✅ Модель завантажено: {current_model_name}")

# # Кеш для embeddings - окремий для кожної моделі
# embeddings_cache = {
#     'sentence-transformers/LaBSE': {'album': {}, 'single': {}, 'song': {}},
#     'paraphrase-multilingual-MiniLM-L12-v2': {'album': {}, 'single': {}, 'song': {}},
#     'distiluse-base-multilingual-cased-v2': {'album': {}, 'single': {}, 'song': {}}
# }

# def get_current_cache():
#     """Повертає кеш для поточної моделі"""
#     global current_model_name, embeddings_cache
    
#     if current_model_name not in embeddings_cache:
#         embeddings_cache[current_model_name] = {'album': {}, 'single': {}, 'song': {}}
    
#     return embeddings_cache[current_model_name]

# def get_text_for_embedding(item, item_type):
#     """Створює текстовий опис для векторизації"""
#     if item_type == 'song':
#         parts = [
#             f"Song creator: {item.get('album_creator', '')}. " if item.get('album_creator') else '',
#             f"Song name: {item.get('name', '')}. ",
#             f"Song from album: {item.get('album_name', '')}. " if item.get('album_name') else '',
#             f"Song genre: {item.get('album_genre', '')}. " if item.get('album_genre') else '',
#             f"Song lyrics: {item.get('lyrics', '')}. ",
#             f"Song description: {item.get('description', '')}. "

#         ]
#     elif item_type == 'single':
#         parts = [
#             f"Single creator: {item.get('creator', '')}. ",
#             f"Single name: {item.get('name', '')}. ",
#             f"Single genre: {item.get('genre', '')}. ",
#             f"Single description: {item.get('description', '')}. ",
#             f"Single lyrics: {item.get('lyrics', '')}. "
#         ]
#     elif item_type == 'album':
#         song_texts = []
#         for song in item.get('songs', []):
#             song_texts.append(f"{song.get('name', '')} {song.get('lyrics', '')} {song.get('description', '')}")
        
#         parts = [
#             f"Album creator: {item.get('creator', '')}. ",
#             f"Album name: {item.get('name', '')}. ",
#             f"Album genre: {item.get('genre', '')}. ",
#             f"Album description: {item.get('description', '')}. ",
#         ]
#     else:
#         parts = []
    
#     text = ' '.join([p for p in parts if p]).strip()
#     text = ' '.join(text.split())
    
#     return text if text else "empty"

# def fetch_music_data():
#     """Отримує дані з основного Node.js API"""
#     try:
#         response = requests.get('http://localhost:5000/api/items', timeout=5)
#         data = response.json()
#         return data
#     except Exception as e:
#         print(f"❌ Помилка при отриманні даних: {e}")
#         return {'albums': [], 'singles': []}

# def build_embeddings():
#     """Створює embeddings для всієї бази для поточної моделі"""
#     global current_model_name, model, embeddings_cache
    
#     print(f"🔄 Оновлення embeddings для моделі: {current_model_name}...")
    
#     # Переконуємось що кеш існує
#     if current_model_name not in embeddings_cache:
#         embeddings_cache[current_model_name] = {'album': {}, 'single': {}, 'song': {}}
    
#     # Очищаємо кеш
#     embeddings_cache[current_model_name] = {'album': {}, 'single': {}, 'song': {}}
    
#     data = fetch_music_data()
    
#     if not data.get('albums') and not data.get('singles'):
#         print("⚠️ База даних порожня")
#         return 0
    
#     all_items = []
    
#     # Обробка альбомів
#     for album in data.get('albums', []):
#         try:
#             album_id = str(album.get('_id', album.get('id', '')))
#             if not album_id:
#                 continue
                
#             album_text = get_text_for_embedding(album, 'album')
            
#             all_items.append({
#                 'id': album_id,
#                 'type': 'album',
#                 'text': album_text,
#                 'data': album
#             })
            
#             # Обробка пісень в альбомі
#             for song in album.get('songs', []):
#                 try:
#                     song_data = {
#                         **song,
#                         'album_creator': album.get('creator', ''),
#                         'album_name': album.get('name', ''),
#                         'album_genre': album.get('genre', ''),
#                         'album_description': album.get('description', '')
#                     }
#                     song_id = str(song.get('_id', ''))
#                     if not song_id:
#                         continue
                        
#                     song_text = get_text_for_embedding(song_data, 'song')
#                     all_items.append({
#                         'id': f"{album_id}_{song_id}",
#                         'type': 'song',
#                         'text': song_text,
#                         'data': {**song, 
#                                  'albumId': album_id,
#                                  'albumCreator': album.get('creator'),
#                                  'albumName': album.get('name'),
#                                  'albumGenre': album.get('genre'),
#                                  'albumDescription': album.get('description')
#                                  }
#                     })
#                 except Exception as e:
#                     print(f"⚠️ Помилка обробки пісні: {e}")
#                     continue
                    
#         except Exception as e:
#             print(f"⚠️ Помилка обробки альбому: {e}")
#             continue
    
#     # Обробка синглів
#     for single in data.get('singles', []):
#         try:
#             single_id = str(single.get('_id', single.get('id', '')))
#             if not single_id:
#                 continue
                
#             single_text = get_text_for_embedding(single, 'single')
            
#             all_items.append({
#                 'id': single_id,
#                 'type': 'single',
#                 'text': single_text,
#                 'data': single
#             })
#         except Exception as e:
#             print(f"⚠️ Помилка обробки синглу: {e}")
#             continue
    
#     if not all_items:
#         print("⚠️ Немає елементів для індексації")
#         return 0
    
#     # Створюємо embeddings
#     print(f"🔄 Створення embeddings для {len(all_items)} елементів...")
#     texts = [item['text'] for item in all_items]
    
#     try:
#         embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True, batch_size=8)
        
#         # Зберігаємо в кеш
#         for item, embedding in zip(all_items, embeddings):
#             embeddings_cache[current_model_name][item['type']][item['id']] = {
#                 'embedding': embedding,
#                 'data': item['data'],
#                 'text': item['text']
#             }
        
#         cache = embeddings_cache[current_model_name]
#         print(f"✅ Створено {len(all_items)} embeddings")
#         print(f"   Альбоми: {len(cache['album'])}")
#         print(f"   Сингли: {len(cache['single'])}")
#         print(f"   Пісні: {len(cache['song'])}")
        
#         return len(all_items)
        
#     except Exception as e:
#         print(f"❌ Помилка створення embeddings: {e}")
#         import traceback
#         traceback.print_exc()
#         return 0

# @app.route('/api/ai/search', methods=['POST'])
# def ai_search():
#     """Семантичний пошук"""
#     global current_model_name, model
    
#     try:
#         query = request.json.get('query', '').strip()
#         top_k = request.json.get('top_k', 10)
        
#         if not query:
#             return jsonify({'error': 'Query is required'}), 400
        
#         # Отримуємо кеш поточної моделі
#         cache = get_current_cache()
        
#         # Нормалізуємо запит
#         normalized_query = query
#         if not any(word in query.lower() for word in ['пісня', 'сингл', 'альбом', 'трек', 'музика']):
#             normalized_query = f"пісня про {query}"
        
#         print(f"🔍 Пошук: '{query}' (модель: {current_model_name})")
        
#         # Перевіряємо чи є embeddings
#         total_items = sum(len(cache[key]) for key in ['album', 'single', 'song'])
#         if total_items == 0:
#             print("⚠️ Кеш порожній, створюємо embeddings...")
#             build_embeddings()
#             cache = get_current_cache()
#             total_items = sum(len(cache[key]) for key in ['album', 'single', 'song'])
            
#         if total_items == 0:
#             return jsonify({
#                 'query': query,
#                 'results': [],
#                 'total_searched': 0,
#                 'message': 'База даних порожня'
#             })
        
#         # Створюємо embedding для запиту
#         query_embedding = model.encode([normalized_query], convert_to_numpy=True)[0]
        
#         # Збираємо всі items
#         all_items = []
#         for item_type in ['album', 'single', 'song']:
#             for item_id, item_data in cache[item_type].items():
#                 all_items.append({
#                     'id': item_id,
#                     'type': item_type,
#                     'embedding': item_data['embedding'],
#                     'data': item_data['data'],
#                     'text': item_data['text']
#                 })
        
#         if not all_items:
#             return jsonify({'query': query, 'results': [], 'total_searched': 0})
        
#         # Обчислюємо схожість
#         embeddings_matrix = np.array([item['embedding'] for item in all_items])
#         similarities = cosine_similarity([query_embedding], embeddings_matrix)[0]
        
#         # Бонус за збіг слів
#         for idx, item in enumerate(all_items):
#             query_words = set(query.lower().split())
#             name = item['data'].get('name', '').lower()
#             name_words = set(name.split())
            
#             matching_words = query_words & name_words
#             if matching_words:
#                 word_bonus = len(matching_words) * 0.15
#                 similarities[idx] = min(1.0, similarities[idx] + word_bonus)
        
#         # Сортуємо
#         results = []
#         for idx, similarity in enumerate(similarities):
#             results.append({
#                 **all_items[idx],
#                 'similarity': float(similarity)
#             })
        
#         results.sort(key=lambda x: x['similarity'], reverse=True)
#         results = results[:top_k]
        
#         # Форматуємо
#         formatted_results = []
#         for item in results:
#             formatted_results.append({
#                 'id': item['id'],
#                 'type': item['type'],
#                 'similarity': item['similarity'],
#                 'data': item['data']
#             })
        
#         return jsonify({
#             'query': query,
#             'normalized_query': normalized_query,
#             'model': current_model_name,
#             'results': formatted_results,
#             'total_searched': len(all_items)
#         })
        
#     except Exception as e:
#         print(f"❌ Помилка пошуку: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/ai/test-models', methods=['POST'])
# def test_models():
#     """Порівняння різних моделей для одного запиту"""
#     try:
#         query = request.json.get('query', 'пісня про літо')
#         top_k = request.json.get('top_k', 5)
        
#         print(f"\n🧪 Тестування моделей для запиту: '{query}'")
        
#         # Моделі для тестування
#         models_to_test = {
#             'LaBSE': 'sentence-transformers/LaBSE',
#             'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
#             'DistilUSE': 'distiluse-base-multilingual-cased-v2'
#         }
        
#         # Отримуємо дані з основної бази
#         data = fetch_music_data()
        
#         # Збираємо всі елементи для тестування
#         all_items = []
#         for album in data.get('albums', []):
#             album_id = str(album.get('_id', album.get('id', '')))
#             if album_id:
#                 all_items.append({
#                     'id': album_id,
#                     'type': 'album',
#                     'name': album.get('name', ''),
#                     'text': get_text_for_embedding(album, 'album'),
#                     'data': album
#                 })
                
#             for song in album.get('songs', []):
#                 song_id = str(song.get('_id', ''))
#                 if song_id:
#                     song_data = {
#                         **song,
#                         'album_name': album.get('name', ''),
#                         'album_description': album.get('description', '')
#                     }
#                     all_items.append({
#                         'id': f"{album_id}_{song_id}",
#                         'type': 'song',
#                         'name': song.get('name', ''),
#                         'text': get_text_for_embedding(song_data, 'song'),
#                         'data': {**song, 'albumId': album_id, 'albumName': album.get('name')}
#                     })
        
#         for single in data.get('singles', []):
#             single_id = str(single.get('_id', single.get('id', '')))
#             if single_id:
#                 all_items.append({
#                     'id': single_id,
#                     'type': 'single',
#                     'name': single.get('name', ''),
#                     'text': get_text_for_embedding(single, 'single'),
#                     'data': single
#                 })
        
#         if not all_items:
#             return jsonify({'error': 'База даних порожня'}), 400
        
#         # Нормалізуємо запит
#         normalized_query = query
#         if not any(word in query.lower() for word in ['пісня', 'сингл', 'альбом', 'трек', 'музика']):
#             normalized_query = f"пісня про {query}"
        
#         # Тестуємо кожну модель
#         comparison_results = {}
        
#         for model_display_name, model_name in models_to_test.items():
#             print(f"\n  📦 Тестування {model_display_name}...")
            
#             try:
#                 # Завантажуємо модель
#                 test_model = SentenceTransformer(model_name)
                
#                 # Створюємо embeddings для всіх елементів
#                 texts = [item['text'] for item in all_items]
#                 item_embeddings = test_model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                
#                 # Створюємо embedding для запиту
#                 query_embedding = test_model.encode([normalized_query], convert_to_numpy=True)[0]
                
#                 # Обчислюємо схожість
#                 similarities = cosine_similarity([query_embedding], item_embeddings)[0]
                
#                 # Додаємо бонус за збіг слів
#                 query_words = set(query.lower().split())
#                 for idx, item in enumerate(all_items):
#                     name = item['name'].lower()
#                     name_words = set(name.split())
#                     matching_words = query_words & name_words
                    
#                     if matching_words:
#                         word_bonus = len(matching_words) * 0.15
#                         similarities[idx] = min(1.0, similarities[idx] + word_bonus)
                
#                 # Створюємо результати
#                 results = []
#                 for idx, similarity in enumerate(similarities):
#                     results.append({
#                         'id': all_items[idx]['id'],
#                         'type': all_items[idx]['type'],
#                         'name': all_items[idx]['name'],
#                         'similarity': float(similarity),
#                         'data': all_items[idx]['data']
#                     })
                
#                 # Сортуємо і беремо топ-k
#                 results.sort(key=lambda x: x['similarity'], reverse=True)
#                 top_results = results[:top_k]
                
#                 # Зберігаємо результати
#                 comparison_results[model_display_name] = {
#                     'model_name': model_name,
#                     'results': top_results,
#                     'avg_similarity': float(np.mean([r['similarity'] for r in top_results])),
#                     'max_similarity': float(max([r['similarity'] for r in top_results])) if top_results else 0
#                 }
                
#                 print(f"    ✅ {model_display_name}: avg={comparison_results[model_display_name]['avg_similarity']:.3f}")
                
#             except Exception as e:
#                 print(f"    ❌ Помилка з {model_display_name}: {e}")
#                 comparison_results[model_display_name] = {
#                     'error': str(e),
#                     'results': []
#                 }
        
#         # Визначаємо найкращу модель
#         best_model = max(
#             [name for name in comparison_results if 'error' not in comparison_results[name]],
#             key=lambda x: comparison_results[x]['avg_similarity'],
#             default=None
#         )
        
#         return jsonify({
#             'query': query,
#             'normalized_query': normalized_query,
#             'comparison': comparison_results,
#             'best_model': best_model,
#             'recommendation': f"Рекомендую використовувати {best_model} для найкращої якості" if best_model else "Не вдалося визначити найкращу модель"
#         })
        
#     except Exception as e:
#         print(f"❌ Помилка тестування моделей: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/ai/set-model', methods=['POST'])
# def set_model():
#     """Змінює активну AI модель"""
#     global model, current_model_name
    
#     try:
#         data = request.get_json()
#         model_key = data.get('model', 'LaBSE')
        
#         models_map = {
#             'LaBSE': 'sentence-transformers/LaBSE',
#             'MiniLM': 'paraphrase-multilingual-MiniLM-L12-v2',
#             'DistilUSE': 'distiluse-base-multilingual-cased-v2'
#         }
        
#         if model_key not in models_map:
#             return jsonify({'error': 'Невідома модель'}), 400
        
#         model_name = models_map[model_key]
        
#         # Якщо модель вже активна
#         if model_name == current_model_name:
#             cache = get_current_cache()
#             total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
#             return jsonify({
#                 'message': f'Модель {model_key} вже активна',
#                 'model': model_name,
#                 'embeddings_count': total
#             })
        
#         print(f"\n🔄 Зміна моделі: {current_model_name} → {model_name}")
        
#         # Завантажуємо нову модель
#         print(f"📦 Завантаження {model_key}...")
#         model = SentenceTransformer(model_name)
#         current_model_name = model_name
        
#         # Перевіряємо чи є embeddings
#         cache = get_current_cache()
#         total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
        
#         count = total
#         if total == 0:
#             print(f"⚠️ Немає embeddings для {model_key}, створюємо...")
#             count = build_embeddings()
#             print(f"✅ Створено {count} embeddings")
#         else:
#             print(f"✅ Використовуємо існуючі embeddings ({total} елементів)")
        
#         return jsonify({
#             'message': f'Модель успішно змінено на {model_key}',
#             'model': model_name,
#             'embeddings_count': count,
#             'embeddings_created': total == 0
#         })
        
#     except Exception as e:
#         print(f"❌ Помилка зміни моделі: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/ai/rebuild', methods=['POST'])
# def rebuild_embeddings():
#     """Перебудувати embeddings"""
#     try:
#         count = build_embeddings()
#         return jsonify({
#             'message': 'Embeddings оновлено',
#             'count': count
#         })
#     except Exception as e:
#         print(f"❌ Помилка rebuild: {e}")
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/ai/status', methods=['GET'])
# def status():
#     """Статус AI сервісу"""
#     cache = get_current_cache()
#     total = sum(len(cache[key]) for key in ['album', 'single', 'song'])
    
#     # Статистика всіх моделей
#     all_models_stats = {}
#     for model_name, model_cache in embeddings_cache.items():
#         model_total = sum(len(model_cache[key]) for key in ['album', 'single', 'song'])
#         if model_total > 0:
#             all_models_stats[model_name] = {
#                 'embeddings_count': model_total,
#                 'albums': len(model_cache['album']),
#                 'singles': len(model_cache['single']),
#                 'songs': len(model_cache['song'])
#             }
    
#     return jsonify({
#         'status': 'online',
#         'current_model': current_model_name,
#         'embeddings_count': total,
#         'cache': {
#             'albums': len(cache['album']),
#             'singles': len(cache['single']),
#             'songs': len(cache['song'])
#         },
#         'all_models': all_models_stats
#     })

# @app.route('/api/ai/health', methods=['GET'])
# def health():
#     """Health check"""
#     return jsonify({'status': 'healthy'})

# if __name__ == '__main__':
#     print("🤖 Запуск AI Search Service...")
#     print(f"📦 Поточна модель: {current_model_name}")
    
#     # Створюємо embeddings для поточної моделі
#     try:
#         print(f"🔄 Створення embeddings...")
#         build_embeddings()
#     except Exception as e:
#         print(f"⚠️ Помилка ініціалізації: {e}")
    
#     print("\n✅ Готово! http://localhost:5001")
#     print(f"📌 Доступні моделі: LaBSE, MiniLM, DistilUSE")
    
#     app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)