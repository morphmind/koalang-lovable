import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  MoreVertical,
  Plus,
  Volume2,
  Book,
  Tag,
  FileText,
  Upload,
  Download
} from 'lucide-react';

interface Word {
  id: string;
  word: string;
  translation: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  usageExample: string;
  audioUrl?: string;
  imageUrl?: string;
  learningCount: number;
  successRate: number;
}

// TODO: Bu veriler API'den gelecek
const mockWords: Word[] = [
  {
    id: '1',
    word: 'accomplish',
    translation: 'başarmak, tamamlamak',
    level: 'B2',
    category: 'Verb',
    usageExample: 'She accomplished all her goals for the year.',
    audioUrl: '/audio/accomplish.mp3',
    imageUrl: '/images/accomplish.jpg',
    learningCount: 1250,
    successRate: 85
  },
  {
    id: '2',
    word: 'benevolent',
    translation: 'hayırsever, iyiliksever',
    level: 'C1',
    category: 'Adjective',
    usageExample: 'The benevolent donor gave millions to charity.',
    audioUrl: '/audio/benevolent.mp3',
    learningCount: 850,
    successRate: 72
  },
  {
    id: '3',
    word: 'concise',
    translation: 'özlü, kısa ve öz',
    level: 'B2',
    category: 'Adjective',
    usageExample: 'Please keep your report concise and to the point.',
    audioUrl: '/audio/concise.mp3',
    imageUrl: '/images/concise.jpg',
    learningCount: 1100,
    successRate: 88
  }
];

const WordRow: React.FC<{ word: Word }> = ({ word }) => {
  const getLevelColor = (level: Word['level']) => {
    switch (level) {
      case 'A1':
      case 'A2':
        return 'bg-green-500/10 text-green-500';
      case 'B1':
      case 'B2':
        return 'bg-blue-500/10 text-blue-500';
      case 'C1':
      case 'C2':
        return 'bg-purple-500/10 text-purple-500';
    }
  };

  return (
    <tr className="border-b border-white/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{word.word}</div>
            <div className="text-sm text-white/60">{word.translation}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(word.level)}`}>
          {word.level}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-white/60">
          {word.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-white/60 line-clamp-2">
          {word.usageExample}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{word.learningCount}</span> öğrenen
          </div>
          <div className="text-sm text-white/60">
            <span className="font-medium text-white">{word.successRate}%</span> başarı
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {word.audioUrl && (
            <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          <button className="text-white/60 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const WordsManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredWords = mockWords.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || word.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-bs-navy p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Kelime Yönetimi
        </h1>
        <p className="text-white/60">
          Oxford 3000™ kelime listesini yönetin ve güncelleyin
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            placeholder="Kelime veya çeviri ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <select
            className="block pl-3 pr-10 py-2 text-base border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="Verb">Fiil</option>
            <option value="Noun">İsim</option>
            <option value="Adjective">Sıfat</option>
            <option value="Adverb">Zarf</option>
          </select>

          <button className="px-4 py-2 bg-bs-primary text-white rounded-lg hover:bg-bs-primary/90 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Yeni Kelime</span>
          </button>
        </div>
      </div>

      {/* Words Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Kelime
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Seviye
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Örnek Kullanım
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  İstatistikler
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredWords.map(word => (
                <WordRow key={word.id} word={word} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="fixed bottom-6 right-6 flex space-x-4">
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Toplu İçerik Yükle">
          <Upload className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Dışa Aktar">
          <Download className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Kategori Yönetimi">
          <Tag className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white" title="Toplu Düzenleme">
          <FileText className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
