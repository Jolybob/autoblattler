# Auto Blattler Game

A complete horizontal scrolling auto battler game with admin configuration panel.

## Features

- **Horizontal Scrolling Combat**: Engage in battles with enemies that scroll horizontally across the screen
- **Auto Battler Mechanics**: Inspired by Zad Archery, with automatic combat and wave-based progression
- **Multiple Character Classes**: Choose from Archer, Warrior, Mage, Rogue, and Paladin
- **Skill Tree System**: Deep progression system with passive and active skills
- **Dungeon System**: Multiple dungeons with increasing difficulty and unique bosses
- **Spell System**: Various spells for each class with different effects
- **Loot System**: Collect gold and items from defeated enemies
- **Admin Configuration Panel**: Configure all game parameters including:
  - Character stats and progression
  - Monster stats and wave scaling
  - Spell effects and cooldowns
  - Dungeon parameters
  - Class unlock levels
  - Skill tree parameters
  - Progression curves

## Game Structure

```
autoblattler/
├── index.html              # Main game HTML
├── css/
│   └── style.css          # Game styles
├── js/
│   ├── main.js            # Game initialization
│   ├── game/
│   │   ├── GameEngine.js      # Main game engine
│   │   ├── CombatSystem.js    # Combat logic
│   │   ├── ProgressionSystem.js # XP and leveling
│   │   └── Renderer.js        # Visual rendering
│   ├── data/
│   │   ├── models.js         # Core data models
│   │   ├── Character.js       # Character class
│   │   ├── Monster.js         # Monster class
│   │   ├── Spell.js          # Spell class
│   │   ├── Dungeon.js        # Dungeon class
│   │   ├── Class.js          # Class management
│   │   ├── SkillTree.js      # Skill tree system
│   │   └── dataManager.js    # Data persistence
│   ├── config/
│   │   ├── ConfigManager.js  # Configuration management
│   │   └── AdminPanel.js     # Admin panel UI
│   └── utils/
│       ├── helpers.js       # Utility functions
│       └── fileUtils.js     # File handling
└── assets/
    ├── images/
    └── sounds/
```

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jolybob/autoblattler.git
   ```

2. **Open the game**:
   - Simply open `index.html` in a web browser
   - No server required - runs entirely client-side

3. **Play the game**:
   - Click "Start Wave" to begin
   - Use spell buttons or number keys (1, 2, 3) to cast spells
   - Press Space to start the next wave

## Admin Panel

Access the admin panel by clicking the "Admin Panel" button in the top-right corner.

### Configuration Tabs

- **Characters**: Configure base stats, health, mana, attack, defense, and level scaling
- **Monsters**: Adjust monster health, attack, gold drops, XP, and wave scaling
- **Spells**: Modify spell damage, cooldowns, and mana costs
- **Dungeons**: Change dungeon length, boss multipliers, and rewards
- **Classes**: Set class unlock levels
- **Skill Tree**: Configure skill points, max depth, and effect multipliers
- **Progression**: Adjust XP curves, gold scaling, and loot drop chances

### Export/Import

- **Export All Configurations**: Download current configurations as a JSON file
- **Import Configurations**: Load configurations from a JSON file
- **Reset to Default**: Restore all configurations to default values

## Data Persistence

The game uses JSON export/import for data persistence as requested:

- **Export Game**: Save your current game state to a JSON file
- **Import Game**: Load a previously saved game state
- **Configurations**: All admin panel configurations can be exported and imported

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Start next wave |
| 1 | Cast first spell |
| 2 | Cast second spell |
| 3 | Cast third spell |
| Escape | Close admin panel |

## Game Mechanics

### Combat
- Player auto-attacks the closest enemy
- Monsters attack when in range
- Each class has unique abilities
- Bosses appear every 5th wave

### Progression
- Gain XP from defeating enemies
- Level up to unlock new abilities
- Collect gold to buy items
- Complete dungeons for special rewards

### Classes
- **Archer**: High damage, ranged attacks
- **Warrior**: High health, melee combat
- **Mage**: High mana, powerful spells
- **Rogue**: High crit chance, fast attacks
- **Paladin**: Balanced, healing abilities

## Development

### Adding New Content

1. **New Character Class**:
   - Add to `ClassDefinitions` in `js/data/models.js`
   - Create skill tree in `SkillTreeDefinitions`

2. **New Monster**:
   - Add to `MonsterDefinitions` in `js/data/models.js`
   - Define stats, appearance, and abilities

3. **New Spell**:
   - Add to `SpellDefinitions` in `js/data/models.js`
   - Define type, effects, and costs

4. **New Dungeon**:
   - Add to `DungeonDefinitions` in `js/data/models.js`
   - Define waves, monsters, boss, and rewards

### Configuration

All game parameters can be configured through the admin panel or by directly modifying `GameConfig` in `js/data/models.js`.

## Browser Support

The game is designed to work in modern browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## License

This project is open source and available for personal and commercial use.

## Credits

Inspired by [Zad Archery](https://store.steampowered.com/app/4412000/Zad_Archery/) on Steam.

## Contributing

Contributions are welcome! Feel free to submit pull requests with new features, bug fixes, or improvements.