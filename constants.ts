import { Difficulty, GameConfig, LevelId } from './types';

export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export const GRAVITY = 0.6;
export const JUMP_FORCE = -18;
export const GROUND_Y = 850;

// 实体尺寸配置 (Entity Dimensions)
// 修改这里的数值以匹配你的美术素材分辨率
export const ENTITY_SPECS = {
  PLAYER: { WIDTH: 70, HEIGHT: 94 },      // 主角尺寸
  ENEMY: { WIDTH: 90, HEIGHT: 90 },       // 敌人尺寸
  COLLECTIBLE: { WIDTH: 60, HEIGHT: 60 }, // 收集物尺寸
  PROJECTILE: { WIDTH: 40, HEIGHT: 20 }   // 鞭炮/子弹尺寸
};

// Configurations based on User Request
export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  [Difficulty.EASY]: {
    playerSpeed: 8, 
    enemySpeed: 10,
    spawnInterval: 2000,
    enemyCap: 3,
    levelLength: 10000 
  },
  [Difficulty.MEDIUM]: {
    playerSpeed: 12,
    enemySpeed: 16,
    spawnInterval: 1500,
    enemyCap: 5,
    levelLength: 15000
  },
  [Difficulty.HARD]: {
    playerSpeed: 16,
    enemySpeed: 24,
    spawnInterval: 1000,
    enemyCap: 8,
    levelLength: 20000
  }
};

export const LEVEL_THEMES: Record<LevelId, {
  name: string;
  description: string;
  bgColor: string;
  groundColor: string;
  collectibleName: string;
  collectibleColor: string;
  heroColor: string;
}> = {
  [LevelId.ONE]: {
    name: "除夕之夜",
    description: "帮小朋友找回丢失的压岁钱！",
    bgColor: '#7a1a1a', // 深红
    groundColor: '#d4af37', // 金色
    collectibleName: '红包',
    collectibleColor: '#ff0000',
    heroColor: '#3b82f6' // 蓝色
  },
  [LevelId.TWO]: {
    name: "归乡途",
    description: "帮打工人捡回掉落的钱包！",
    bgColor: '#1e3a8a', // 深蓝/城市夜景
    groundColor: '#4b5563', // 水泥地
    collectibleName: '钱包',
    collectibleColor: '#8B4513',
    heroColor: '#10b981' // 翡翠绿
  }
};

export const LEVEL_STORIES: Record<LevelId, {
  title: string;
  text: string[];
}> = {
  [LevelId.ONE]: {
    title: "压岁钱去哪了",
    text: [
      "今天是除夕夜。",
      "小明拿着压岁钱开心地往家跑。",
      "突然，年兽出现了！",
      "他吓了一跳，红包撒了一地！",
      "快跑！在午夜前把它们都捡回来！"
    ]
  },
  [LevelId.TWO]: {
    title: "薪水保卫战",
    text: [
      "辛苦工作的一年终于结束了。",
      "王先生正急着赶往火车站。",
      "糟了！钱包从口袋里掉出来了！",
      "还有年兽挡路？",
      "用鞭炮炸开一条路！"
    ]
  }
};

// Asset Paths - Put files in these locations to replace placeholders
export const ASSETS = {
  IMAGES: {
    PLAYER: 'assets/images/player.png',
    ENEMY: 'assets/images/enemy.png',
    BG: 'assets/images/bg.png',
    GROUND: 'assets/images/ground.png',
    COIN: 'assets/images/coin.png',
    AMMO: 'assets/images/ammo.png',
    PROJECTILE: 'assets/images/projectile.png',
  },
  SOUNDS: {
    BGM: 'assets/sounds/bgm.mp3',
    JUMP: 'assets/sounds/jump.mp3',
    SHOOT: 'assets/sounds/shoot.mp3',
    EXPLOSION: 'assets/sounds/explosion.mp3',
    COLLECT: 'assets/sounds/collect.mp3',
    WIN: 'assets/sounds/win.mp3',
    GAMEOVER: 'assets/sounds/gameover.mp3',
  }
};