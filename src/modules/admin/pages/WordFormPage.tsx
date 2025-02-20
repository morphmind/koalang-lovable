import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Word } from '../types/word';
import { wordService } from '../services/wordService';
import { useNotification } from '@/modules/notifications/context/NotificationContext';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const CATEGORIES = [
  'Günlük Hayat',
  'İş Hayatı',
  'Eğitim',
  'Seyahat',
  'Teknoloji',
  'Sağlık',
  'Spor',
  'Sanat',
  'Yemek',
  'Diğer'
];

const WordFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [word, setWord] = useState<Partial<Word>>({
    english: '',
    turkish: '',
    level: 'A1',
    category: CATEGORIES[0],
    example_sentence: ''
  });

  useEffect(() => {
    if (id) {
      loadWord(id);
    }
  }, [id]);

  const loadWord = async (wordId: string) => {
    try {
      setLoading(true);
      const data = await wordService.getWordById(wordId);
      setWord(data);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Kelime yüklenirken bir hata oluştu'
      });
      navigate('/admin/words');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (id) {
        await wordService.updateWord(id, word);
        showNotification({
          type: 'success',
          message: 'Kelime başarıyla güncellendi'
        });
      } else {
        await wordService.createWord(word);
        showNotification({
          type: 'success',
          message: 'Kelime başarıyla eklendi'
        });
      }
      navigate('/admin/words');
    } catch (error) {
      showNotification({
        type: 'error',
        message: id ? 'Kelime güncellenirken bir hata oluştu' : 'Kelime eklenirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWord(prev => ({ ...prev, [name]: value }));
  };

  if (loading && id) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/words')}
          className="inline-flex items-center text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kelimelere Dön
        </button>

        <h1 className="text-2xl font-bold text-white">
          {id ? 'Kelimeyi Düzenle' : 'Yeni Kelime Ekle'}
        </h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="english" className="block text-sm font-medium text-white/60 mb-2">
                  İngilizce
                </label>
                <input
                  type="text"
                  id="english"
                  name="english"
                  required
                  value={word.english}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="turkish" className="block text-sm font-medium text-white/60 mb-2">
                  Türkçe
                </label>
                <input
                  type="text"
                  id="turkish"
                  name="turkish"
                  required
                  value={word.turkish}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-white/60 mb-2">
                    Seviye
                  </label>
                  <select
                    id="level"
                    name="level"
                    required
                    value={word.level}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white/60 mb-2">
                    Kategori
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={word.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="example_sentence" className="block text-sm font-medium text-white/60 mb-2">
                  Örnek Cümle
                </label>
                <textarea
                  id="example_sentence"
                  name="example_sentence"
                  rows={3}
                  value={word.example_sentence}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WordFormPage;
