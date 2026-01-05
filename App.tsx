import React, { useState, useEffect } from 'react';
import { AppScreen, Difficulty, LevelId } from './types';
import { GameCanvas } from './components/GameCanvas';
import { LEVEL_THEMES, LEVEL_STORIES } from './constants';
import { audioManager } from './services/audioService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.START);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(LevelId.ONE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [result, setResult] = useState<{ score: number, collected: number }>({ score: 0, collected: 0 });

  // Stop BGM when returning to start or game over
  useEffect(() => {
    if (screen === AppScreen.START) {
      audioManager.stopBGM();
    }
  }, [screen]);

  const goToStory = () => {
    // Attempt to initialize audio context on user interaction
    audioManager.playCollect(); // Just a dummy sound to wake up audio context
    setScreen(AppScreen.STORY);
  };

  const startGame = () => {
    setScreen(AppScreen.GAME);
  };

  const handleGameOver = (score: number, collected: number) => {
    setResult({ score, collected });
    setScreen(AppScreen.GAME_OVER);
    audioManager.playGameOver();
  };

  const handleVictory = (score: number, collected: number) => {
    setResult({ score, collected });
    setScreen(AppScreen.VICTORY);
    audioManager.playWin();
  };

  return (
    <div className="w-screen h-screen bg-neutral-900 flex items-center justify-center overflow-hidden">
      {/* Container to enforce 16:9 aspect ratio */}
      <div className="aspect-video w-full max-w-[1920px] max-h-[1080px] bg-gray-800 relative shadow-2xl overflow-hidden">
        
        {/* START SCREEN */}
        {screen === AppScreen.START && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center animate-bounce-slow">
              <h1 className="text-8xl text-yellow-400 font-bold mb-4 drop-shadow-[0_5px_5px_rgba(255,0,0,0.8)]">
                年兽大作战
              </h1>
              <h2 className="text-4xl text-white mb-12">奔跑，跳跃，过大年！</h2>
              <button 
                onClick={() => setScreen(AppScreen.LEVEL_SELECT)}
                className="px-12 py-6 bg-red-600 hover:bg-red-500 text-white text-4xl rounded-xl border-4 border-yellow-500 shadow-lg transform transition hover:scale-105 active:scale-95"
              >
                开始游戏
              </button>
            </div>
          </div>
        )}

        {/* LEVEL SELECT */}
        {screen === AppScreen.LEVEL_SELECT && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <h2 className="text-5xl text-white mb-12">选择关卡</h2>
            <div className="flex gap-8">
              {/* Level 1 Card */}
              <button 
                onClick={() => { setSelectedLevel(LevelId.ONE); setScreen(AppScreen.DIFFICULTY_SELECT); }}
                className="group relative w-96 h-[500px] bg-red-900 rounded-2xl overflow-hidden border-4 border-transparent hover:border-yellow-400 transition-all hover:-translate-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
                <div className="absolute bottom-8 left-8 text-left">
                  <div className="text-xl text-yellow-300 mb-2">第一关</div>
                  <h3 className="text-4xl text-white font-bold mb-2">除夕夜</h3>
                  <p className="text-gray-300">帮小朋友找回丢失的红包！</p>
                </div>
                <div className="absolute top-4 right-4 text-6xl">🧧</div>
              </button>

              {/* Level 2 Card */}
              <button 
                onClick={() => { setSelectedLevel(LevelId.TWO); setScreen(AppScreen.DIFFICULTY_SELECT); }}
                className="group relative w-96 h-[500px] bg-blue-900 rounded-2xl overflow-hidden border-4 border-transparent hover:border-green-400 transition-all hover:-translate-y-4"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
                <div className="absolute bottom-8 left-8 text-left">
                  <div className="text-xl text-green-300 mb-2">第二关</div>
                  <h3 className="text-4xl text-white font-bold mb-2">赶春运</h3>
                  <p className="text-gray-300">帮打工人找回丢失的钱包！</p>
                </div>
                <div className="absolute top-4 right-4 text-6xl">💼</div>
              </button>
            </div>
             <button onClick={() => setScreen(AppScreen.START)} className="mt-12 text-gray-400 hover:text-white underline">返回</button>
          </div>
        )}

        {/* DIFFICULTY SELECT */}
        {screen === AppScreen.DIFFICULTY_SELECT && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white">
            <h2 className="text-5xl mb-16">选择难度</h2>
            <div className="flex flex-col gap-6 w-1/3">
              <button 
                onClick={() => { setSelectedDifficulty(Difficulty.EASY); goToStory(); }}
                className="p-6 bg-green-600 hover:bg-green-500 rounded-xl text-3xl font-bold transition hover:scale-105"
              >
                简单
                <span className="block text-sm font-normal mt-1 opacity-80">速度：慢 | 敌人：少</span>
              </button>
              <button 
                onClick={() => { setSelectedDifficulty(Difficulty.MEDIUM); goToStory(); }}
                className="p-6 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-3xl font-bold transition hover:scale-105"
              >
                中等
                 <span className="block text-sm font-normal mt-1 opacity-80">速度：正常 | 敌人：适中</span>
              </button>
              <button 
                onClick={() => { setSelectedDifficulty(Difficulty.HARD); goToStory(); }}
                className="p-6 bg-red-600 hover:bg-red-500 rounded-xl text-3xl font-bold transition hover:scale-105"
              >
                困难
                 <span className="block text-sm font-normal mt-1 opacity-80">速度：快 | 敌人：噩梦</span>
              </button>
            </div>
            <button onClick={() => setScreen(AppScreen.LEVEL_SELECT)} className="mt-12 text-gray-400 hover:text-white underline">返回</button>
          </div>
        )}

        {/* STORY / INTRO SCREEN */}
        {screen === AppScreen.STORY && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-20 animate-fade-in">
             <div className="border-4 border-white p-12 bg-gray-900 max-w-4xl w-full text-center rounded-sm shadow-2xl">
                <div className="text-yellow-400 text-2xl mb-8 tracking-widest uppercase border-b border-gray-700 pb-4">
                  {LEVEL_STORIES[selectedLevel].title}
                </div>
                <div className="space-y-6 mb-12">
                  {LEVEL_STORIES[selectedLevel].text.map((line, idx) => (
                    <p key={idx} className="text-3xl font-mono leading-relaxed typewriter-effect" style={{animationDelay: `${idx * 0.5}s`}}>
                      {line}
                    </p>
                  ))}
                </div>
                
                <div className="flex justify-center gap-8 mt-12">
                   <div className="text-center">
                     <div className="w-16 h-16 bg-blue-500 mx-auto mb-2 border-2 border-white"></div>
                     <span className="text-sm text-gray-400">跳跃 (空格)</span>
                   </div>
                   <div className="text-center">
                     <div className="w-16 h-16 bg-red-600 mx-auto mb-2 border-2 border-yellow-400 flex items-center justify-center text-xl font-bold">F</div>
                     <span className="text-sm text-gray-400">攻击 (F键)</span>
                   </div>
                </div>

                <button 
                  onClick={startGame}
                  className="mt-12 px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black text-3xl font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  开始任务
                </button>
             </div>
           </div>
        )}

        {/* GAME LOOP */}
        {screen === AppScreen.GAME && (
          <GameCanvas 
            levelId={selectedLevel} 
            difficulty={selectedDifficulty}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onExit={() => setScreen(AppScreen.START)}
          />
        )}

        {/* GAME OVER */}
        {screen === AppScreen.GAME_OVER && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white animate-fade-in">
            <h2 className="text-7xl text-red-500 font-bold mb-4">被年兽抓住了！</h2>
            <div className="text-2xl text-gray-300 mb-8">明年再来吧。</div>
            
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 min-w-[400px] mb-8">
              <div className="flex justify-between text-2xl mb-4">
                <span>得分：</span>
                <span className="text-yellow-400">{result.score}</span>
              </div>
              <div className="flex justify-between text-2xl">
                <span>收集物品：</span>
                <span className="text-green-400">{result.collected}</span>
              </div>
            </div>

            <div className="flex gap-6">
              <button 
                onClick={() => setScreen(AppScreen.LEVEL_SELECT)}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-xl"
              >
                主菜单
              </button>
              <button 
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-xl font-bold animate-pulse"
              >
                再试一次
              </button>
            </div>
          </div>
        )}

        {/* VICTORY */}
        {screen === AppScreen.VICTORY && (
          <div className="absolute inset-0 bg-yellow-900/90 flex flex-col items-center justify-center text-white animate-fade-in">
            <h2 className="text-7xl text-yellow-400 font-bold mb-4">新年快乐！</h2>
            <div className="text-3xl text-white mb-8">
              {selectedLevel === LevelId.ONE ? "小朋友找回了压岁钱！" : "打工人保住了年终奖！"}
            </div>
            
            <div className="bg-black/50 p-8 rounded-xl border-2 border-yellow-500 min-w-[400px] mb-8 text-center">
              <div className="text-6xl text-yellow-300 mb-2">{result.score + (result.collected * 1000)}</div>
              <div className="text-sm text-gray-300">总得分</div>
            </div>

            <button 
              onClick={() => setScreen(AppScreen.START)}
              className="px-12 py-4 bg-green-600 hover:bg-green-500 rounded-xl text-2xl font-bold shadow-lg"
            >
              再玩一次
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;