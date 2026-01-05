import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Difficulty, GameConfig, LevelId, Entity, Player, Enemy, Collectible } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, JUMP_FORCE, GROUND_Y, DIFFICULTY_CONFIG, LEVEL_THEMES, ASSETS, ENTITY_SPECS } from '../constants';
import { audioManager } from '../services/audioService';

interface GameCanvasProps {
  levelId: LevelId;
  difficulty: Difficulty;
  onGameOver: (score: number, collected: number) => void;
  onVictory: (score: number, collected: number) => void;
  onExit: () => void;
}

// Helper to load images safely
const useImages = () => {
  const [images, setImages] = useState<Record<string, HTMLImageElement | null>>({});

  useEffect(() => {
    const loadedImages: Record<string, HTMLImageElement | null> = {};
    const toLoad = [
      { key: 'player', src: ASSETS.IMAGES.PLAYER },
      { key: 'enemy', src: ASSETS.IMAGES.ENEMY },
      { key: 'bg', src: ASSETS.IMAGES.BG },
      { key: 'ground', src: ASSETS.IMAGES.GROUND },
      { key: 'coin', src: ASSETS.IMAGES.COIN },
      { key: 'ammo', src: ASSETS.IMAGES.AMMO },
      { key: 'projectile', src: ASSETS.IMAGES.PROJECTILE },
    ];

    toLoad.forEach(item => {
      const img = new Image();
      img.src = item.src;
      img.onload = () => {
        setImages(prev => ({ ...prev, [item.key]: img }));
      };
      // If error, we just don't set it, so we fallback to rects
    });
  }, []);

  return images;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ levelId, difficulty, onGameOver, onVictory, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const loadedAssets = useImages(); // Load our pixel art
  
  // Game State Refs
  const config = useRef<GameConfig>(DIFFICULTY_CONFIG[difficulty]);
  const frameCount = useRef<number>(0);
  const distance = useRef<number>(0);
  const score = useRef<number>(0);
  const collectedCount = useRef<number>(0);
  
  const player = useRef<Player>({
    x: 200,
    y: GROUND_Y - 100,
    width: ENTITY_SPECS.PLAYER.WIDTH,
    height: ENTITY_SPECS.PLAYER.HEIGHT,
    vy: 0,
    isJumping: false,
    active: true,
    lives: 1,
    ammo: 3
  });

  const enemies = useRef<Enemy[]>([]);
  const collectibles = useRef<Collectible[]>([]);
  const projectiles = useRef<Entity[]>([]);

  const [hudState, setHudState] = useState({ ammo: 3, score: 0, progress: 0 });

  const handleInput = useCallback((type: 'JUMP' | 'SHOOT') => {
    if (type === 'JUMP') {
      if (!player.current.isJumping) {
        player.current.vy = JUMP_FORCE;
        player.current.isJumping = true;
        audioManager.playJump();
      }
    } else if (type === 'SHOOT') {
      if (player.current.ammo > 0) {
        player.current.ammo--;
        audioManager.playShoot();
        projectiles.current.push({
          x: player.current.x + player.current.width,
          y: player.current.y + player.current.height / 2,
          width: ENTITY_SPECS.PROJECTILE.WIDTH,
          height: ENTITY_SPECS.PROJECTILE.HEIGHT,
          active: true
        });
        setHudState(prev => ({ ...prev, ammo: player.current.ammo }));
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // CRITICAL: Disable anti-aliasing for pixel art look
    ctx.imageSmoothingEnabled = false;

    // Reset State
    enemies.current = [];
    collectibles.current = [];
    projectiles.current = [];
    distance.current = 0;
    score.current = 0;
    collectedCount.current = 0;
    player.current.y = GROUND_Y - 100;
    player.current.vy = 0;
    player.current.ammo = 3;
    player.current.active = true;

    // Try to play BGM if not already playing (User has already interacted to get here)
    audioManager.playBGM();

    const theme = LEVEL_THEMES[levelId];
    const cfg = config.current;

    const spawnEnemy = () => {
       if (enemies.current.length < cfg.enemyCap) {
         enemies.current.push({
           type: 'NIAN',
           x: CANVAS_WIDTH + Math.random() * 500,
           y: GROUND_Y - 90,
           width: ENTITY_SPECS.ENEMY.WIDTH,
           height: ENTITY_SPECS.ENEMY.HEIGHT,
           active: true
         });
       }
    };

    const spawnCollectible = () => {
      const isAmmo = Math.random() > 0.8;
      collectibles.current.push({
        type: isAmmo ? 'AMMO' : 'COIN',
        x: CANVAS_WIDTH + Math.random() * 200,
        y: GROUND_Y - 150 - Math.random() * 200,
        width: ENTITY_SPECS.COLLECTIBLE.WIDTH,
        height: ENTITY_SPECS.COLLECTIBLE.HEIGHT,
        active: true
      });
    };

    const update = () => {
      if (!player.current.active) return;
      
      frameCount.current++;
      distance.current += cfg.playerSpeed;
      score.current++; 

      if (distance.current >= cfg.levelLength) {
        onVictory(score.current, collectedCount.current);
        player.current.active = false;
        return;
      }

      const spawnFrames = Math.floor((cfg.spawnInterval / 1000) * 60);
      if (frameCount.current % spawnFrames === 0) spawnEnemy();
      if (frameCount.current % (spawnFrames * 1.5) === 0) spawnCollectible();

      // Physics
      player.current.vy += GRAVITY;
      player.current.y += player.current.vy;

      if (player.current.y > GROUND_Y - player.current.height) {
        player.current.y = GROUND_Y - player.current.height;
        player.current.vy = 0;
        player.current.isJumping = false;
      }

      projectiles.current.forEach(p => {
        p.x += 15;
        if (p.x > CANVAS_WIDTH) p.active = false;
      });

      enemies.current.forEach(enemy => {
        enemy.x -= cfg.enemySpeed;
        if (checkCollision(player.current, enemy)) {
          audioManager.playExplosion();
          onGameOver(score.current, collectedCount.current);
          player.current.active = false;
        }
        projectiles.current.forEach(proj => {
          if (proj.active && checkCollision(proj, enemy)) {
            enemy.active = false;
            proj.active = false;
            score.current += 500;
            audioManager.playExplosion();
          }
        });
        if (enemy.x < -100) enemy.active = false;
      });

      collectibles.current.forEach(item => {
        item.x -= cfg.playerSpeed;
        if (checkCollision(player.current, item)) {
          item.active = false;
          if (item.type === 'COIN') {
             score.current += 1000;
             collectedCount.current++;
             audioManager.playCollect();
          } else {
             player.current.ammo++;
             audioManager.playCollect();
          }
        }
        if (item.x < -100) item.active = false;
      });

      enemies.current = enemies.current.filter(e => e.active);
      collectibles.current = collectibles.current.filter(c => c.active);
      projectiles.current = projectiles.current.filter(p => p.active);

      if (frameCount.current % 10 === 0) {
        setHudState({
          ammo: player.current.ammo,
          score: score.current,
          progress: Math.min(100, (distance.current / cfg.levelLength) * 100)
        });
      }
    };

    const draw = () => {
      // Background
      if (loadedAssets.bg) {
        // Simple parallax effect or tiling
        // Calculate offset based on distance
        // NOTE: For a real looping bg, you'd draw it twice
        ctx.drawImage(loadedAssets.bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        ctx.fillStyle = theme.bgColor;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // Ground
      if (loadedAssets.ground) {
        // Tile the ground
        const groundW = loadedAssets.ground.width;
        const groundH = CANVAS_HEIGHT - GROUND_Y;
        const offset = -(distance.current % groundW);
        for (let x = offset; x < CANVAS_WIDTH; x += groundW) {
             ctx.drawImage(loadedAssets.ground, x, GROUND_Y, groundW, groundH);
        }
      } else {
        ctx.fillStyle = theme.groundColor;
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      }

      // Goal Line
      const goalScreenX = (cfg.levelLength - distance.current) + 200;
      if (goalScreenX < CANVAS_WIDTH) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(goalScreenX, 0, 20, GROUND_Y);
        ctx.fillStyle = '#FFD700';
        ctx.font = '40px Arial';
        ctx.fillText('终点', goalScreenX - 40, GROUND_Y - 20);
      }

      // Player
      if (loadedAssets.player) {
         // Simple running bounce effect
         const bounce = (!player.current.isJumping && player.current.active) 
            ? Math.sin(frameCount.current * 0.5) * 3 
            : 0;

         ctx.drawImage(
           loadedAssets.player, 
           player.current.x, 
           player.current.y + bounce, 
           player.current.width, 
           player.current.height
         );
      } else {
        ctx.fillStyle = theme.heroColor;
        ctx.fillRect(player.current.x, player.current.y, player.current.width, player.current.height);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.current.x + 50, player.current.y + 10, 20, 20);
      }

      // Enemies
      enemies.current.forEach(e => {
        if (loadedAssets.enemy) {
          ctx.drawImage(loadedAssets.enemy, e.x, e.y, e.width, e.height);
        } else {
          ctx.fillStyle = '#ff3333';
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + e.height);
          ctx.lineTo(e.x + e.width / 2, e.y);
          ctx.lineTo(e.x + e.width, e.y + e.height);
          ctx.fill();
        }
      });

      // Collectibles
      collectibles.current.forEach(c => {
        if (c.type === 'COIN' && loadedAssets.coin) {
          ctx.drawImage(loadedAssets.coin, c.x, c.y, c.width, c.height);
        } else if (c.type === 'AMMO' && loadedAssets.ammo) {
          ctx.drawImage(loadedAssets.ammo, c.x, c.y, c.width, c.height);
        } else {
          // Fallback
          if (c.type === 'COIN') {
             ctx.fillStyle = theme.collectibleColor;
             ctx.beginPath();
             ctx.arc(c.x + c.width/2, c.y + c.height/2, c.width/2, 0, Math.PI * 2);
             ctx.fill();
          } else {
             ctx.fillStyle = '#ff00ff';
             ctx.fillRect(c.x, c.y, c.width, c.height);
          }
        }
      });

      // Projectiles
      projectiles.current.forEach(p => {
        if (loadedAssets.projectile) {
          ctx.drawImage(loadedAssets.projectile, p.x, p.y, p.width, p.height);
        } else {
          ctx.fillStyle = '#FFFF00';
          ctx.fillRect(p.x, p.y, p.width, p.height);
        }
      });
    };

    const loop = () => {
      update();
      draw();
      if (player.current.active) {
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [levelId, difficulty, onGameOver, onVictory, loadedAssets]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleInput('JUMP');
      if (e.code === 'KeyF') handleInput('SHOOT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  return (
    <div className="relative w-full h-full group" 
         onClick={() => handleInput('JUMP')} 
         onContextMenu={(e) => { e.preventDefault(); handleInput('SHOOT'); }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-black"
      />
      
      {/* HUD Layer */}
      <div className="absolute top-4 left-4 flex gap-6 text-white text-2xl font-bold font-mono tracking-wider drop-shadow-md select-none pointer-events-none">
        <div className="bg-black/50 px-4 py-2 rounded-lg border-2 border-yellow-500">
           得分: {hudState.score}
        </div>
        <div className="bg-black/50 px-4 py-2 rounded-lg border-2 border-red-500 text-red-400">
           🧨 鞭炮: {hudState.ammo}
        </div>
      </div>

      <div className="absolute top-4 right-4 w-64 h-8 bg-gray-700 rounded-full border-2 border-white overflow-hidden pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 to-red-600 transition-all duration-200"
          style={{ width: `${hudState.progress}%` }}
        ></div>
      </div>

      <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); handleInput('SHOOT'); }}
          className="w-24 h-24 bg-red-600 rounded-full border-4 border-yellow-400 text-white font-bold text-xl active:scale-95 shadow-lg flex items-center justify-center"
        >
          🧨 (F)
        </button>
      </div>

       <button 
          onClick={onExit}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 hover:bg-white/40 text-white px-4 py-1 rounded pointer-events-auto"
        >
          退出
        </button>
    </div>
  );
};

function checkCollision(a: Entity, b: Entity) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}