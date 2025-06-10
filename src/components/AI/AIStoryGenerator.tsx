// src/components/AI/AIStoryGenerator.tsx
import React, { useState } from 'react';
import { Wand2, Brain, Sparkles, Download } from 'lucide-react';
import { aiService } from '../../services/api';

interface AIStoryGeneratorProps {
  onStoryGenerated?: (story: any) => void;
}

const AIStoryGenerator: React.FC<AIStoryGeneratorProps> = ({ onStoryGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState({
    genre: 'fiction',
    tone: 'neutral',
    length: 'medium',
    target_audience: 'general'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<any>(null);

  const genres = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci-fi', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'horror', label: 'Horror' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' }
  ];

  const tones = [
    { value: 'happy', label: 'Happy' },
    { value: 'sad', label: 'Sad' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'exciting', label: 'Exciting' },
    { value: 'calm', label: 'Calm' },
    { value: 'intense', label: 'Intense' },
    { value: 'neutral', label: 'Neutral' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (500-1000 words)' },
    { value: 'medium', label: 'Medium (1000-2000 words)' },
    { value: 'long', label: 'Long (2000+ words)' }
  ];

  const audiences = [
    { value: 'children', label: 'Children' },
    { value: 'teens', label: 'Teenagers' },
    { value: 'adults', label: 'Adults' },
    { value: 'general', label: 'General Audience' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await aiService.generateStory(prompt, parameters);
      setGeneratedStory(response);
      onStoryGenerated?.(response);
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParameterChange = (key: string, value: string) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Brain className="h-8 w-8 text-purple-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">AI Story Generator</h2>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Prompt *
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe the story you want to generate. Be as detailed as possible..."
        />
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <select
            value={parameters.genre}
            onChange={(e) => handleParameterChange('genre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            {genres.map(genre => (
              <option key={genre.value} value={genre.value}>{genre.label}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <select
            value={parameters.tone}
            onChange={(e) => handleParameterChange('tone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            {tones.map(tone => (
              <option key={tone.value} value={tone.value}>{tone.label}</option>
            ))}
          </select>
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
          <select
            value={parameters.length}
            onChange={(e) => handleParameterChange('length', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            {lengths.map(length => (
              <option key={length.value} value={length.value}>{length.label}</option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
          <select
            value={parameters.target_audience}
            onChange={(e) => handleParameterChange('target_audience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            {audiences.map(audience => (
              <option key={audience.value} value={audience.value}>{audience.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Story...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Story
            </>
          )}
        </button>
      </div>

      {/* Generated Story */}
      {generatedStory && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              Generated Story
            </h3>
            <button
              onClick={() => {
                const blob = new Blob([generatedStory.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${generatedStory.title || 'story'}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="text-purple-600 hover:text-purple-800 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-xl font-bold mb-2">{generatedStory.title}</h4>
            <div className="prose prose-sm max-w-none">
              {generatedStory.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStoryGenerator;