export enum AppScreen {
  START = 'START',
  LEVEL_SELECT = 'LEVEL_SELECT',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  STORY = 'STORY',
  GAME = 'GAME',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum LevelId {
  ONE = 'LEVEL_1_KID',
  TWO = 'LEVEL_2_WORKER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface GameConfig {
  playerSpeed: number; // World scroll speed
  enemySpeed: number;
  spawnInterval: number;
  enemyCap: number;
  levelLength: number; // Distance to finish
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Player extends Entity {
  vy: number;
  isJumping: boolean;
  lives: number;
  ammo: number; // Firecrackers
}

export interface Enemy extends Entity {
  type: 'NIAN';
}

export interface Collectible extends Entity {
  type: 'COIN' | 'AMMO';
}