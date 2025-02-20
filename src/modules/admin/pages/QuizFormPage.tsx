import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Quiz, Question } from '../types/quiz';
import { quizService } from '../services/quizService';
import { useNotification } from '@/modules/notifications/context/NotificationContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const QUIZ_TYPES = [
  { value: 'daily', label: 'Günlük Quiz' },
  { value: 'practice', label: 'Alıştırma' },
  { value: 'test', label: 'Test' }
] as const;

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Çoktan Seçmeli' },
  { value: 'translation', label: 'Çeviri' },
  { value: 'fill_blank', label: 'Boşluk Doldurma' }
] as const;

const QuizFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    level: 'A1',
    type: 'daily',
    status: 'draft',
    questions: []
  });

  useEffect(() => {
    if (id) {
      loadQuiz(id);
    }
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const data = await quizService.getQuizById(quizId);
      setQuiz(data);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Quiz yüklenirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (id) {
        await quizService.updateQuiz(id, quiz);
        showNotification({
          type: 'success',
          message: 'Quiz başarıyla güncellendi'
        });
      } else {
        await quizService.createQuiz(quiz);
        showNotification({
          type: 'success',
          message: 'Quiz başarıyla oluşturuldu'
        });
      }
      navigate('/admin/quizzes');
    } catch (error) {
      showNotification({
        type: 'error',
        message: id ? 'Quiz güncellenirken bir hata oluştu' : 'Quiz oluşturulurken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    setQuiz(prev => {
      const questions = [...(prev.questions || [])];
      questions[index] = { ...questions[index], [field]: value };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          id: `temp-${Date.now()}`,
          quiz_id: id || '',
          word_id: '',
          question_type: 'multiple_choice',
          content: '',
          options: ['', '', '', ''],
          correct_answer: '',
          order: (prev.questions?.length || 0) + 1
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index)
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const questions = Array.from(quiz.questions || []);
    const [reorderedItem] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedItem);

    setQuiz(prev => ({ ...prev, questions }));
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
          onClick={() => navigate('/admin/quizzes')}
          className="inline-flex items-center text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quizlere Dön
        </button>

        <h1 className="text-2xl font-bold text-white">
          {id ? 'Quizi Düzenle' : 'Yeni Quiz Oluştur'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Quiz Details */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Quiz Bilgileri</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/60 mb-2">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={quiz.title}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white/60 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={quiz.description}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-white/60 mb-2">
                  Seviye
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  value={quiz.level}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-white/60 mb-2">
                  Tür
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={quiz.type}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {QUIZ_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/60 mb-2">
                  Durum
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={quiz.status}
                  onChange={handleChange}
                  className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Sorular</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Soru Ekle
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {quiz.questions?.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={question.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white/5 rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-start">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 hover:bg-white/10 rounded-lg cursor-move"
                            >
                              <GripVertical className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="flex-1 ml-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-white/60 mb-2">
                                    Soru Tipi
                                  </label>
                                  <select
                                    value={question.question_type}
                                    onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                  >
                                    {QUESTION_TYPES.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-white/60 mb-2">
                                    Soru İçeriği
                                  </label>
                                  <input
                                    type="text"
                                    value={question.content}
                                    onChange={(e) => handleQuestionChange(index, 'content', e.target.value)}
                                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                  />
                                </div>

                                {question.question_type === 'multiple_choice' && (
                                  <div className="grid grid-cols-2 gap-4">
                                    {question.options?.map((option, optionIndex) => (
                                      <div key={optionIndex}>
                                        <label className="block text-sm font-medium text-white/60 mb-2">
                                          {optionIndex + 1}. Seçenek
                                        </label>
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...(question.options || [])];
                                            newOptions[optionIndex] = e.target.value;
                                            handleQuestionChange(index, 'options', newOptions);
                                          }}
                                          className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div>
                                  <label className="block text-sm font-medium text-white/60 mb-2">
                                    Doğru Cevap
                                  </label>
                                  <input
                                    type="text"
                                    value={question.correct_answer}
                                    onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-white/60 mb-2">
                                    Açıklama
                                  </label>
                                  <input
                                    type="text"
                                    value={question.explanation}
                                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                    className="block w-full px-4 py-2.5 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
  );
};

export default QuizFormPage;
