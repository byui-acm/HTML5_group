# FlipSide Description
***HTML5_group***

###A Tactical Battleship RPG
This idea was found on squidi.net on a list of free game ideas. 
There are currently well over 100 ideas on this site. Pictures are taken from this site. 
This is a multi-player game, or perhaps at some point it could contain an AI. The player can 
see any side that they have at least one unit on. There are a minimum of three types of units; 
melee units, archers, and mages. The functions of melee and archer units are pretty simple and 
self-explanatory, but the mages are special. Each team has 2 mages, one diagonal and one square. 
They can one their turn flip all squares on their lines across the entire grid. They are not 
directly part of combat, and cannot be killed, nor are counted against victory. They are pushed 
back by one on any attack. There can also be special terrain features. Units get a 25% bonus to 
damage for being on the right color, and units gain 25% defense for being on the right color. 
These bonuses can cancel each other out.

---

##How To Play *and* Rules
 **Objective**   _To remove enemy mages from board_ 
 Add more here to help understand mechanics and play


---

## Units
| Unit          | Description    |
| ------------- |:-------------|
| Melee     | can attack all squares around them each round, encouraging them to be surrounded. They have more hit points than archers, but move slower. |
| Archers   | can attack units 3 or 4 squares away, move quickly, and hit hard, but have low hit points. An archer can take out another in 2 hits. |
| Mages     | alter the fabric of reality, throwing combatants and the land they stand on across the realms. They do so in patters like the available moves of bishops and rooks in chess. They can protect themselves from damage, but are pushed back a space when attacked. They flip sides with their spells. |

## Unit Data
|Unit            | Damage | Range  | Speed  | Health | 
|--------------- |:------:|:------:|:------:|:------:|
| Melee          | 1      | 1      | 2      | 10     |
| Archer         | 3      | 3-4    | 4      | 5      |
| Mage           | ?      | ?      | 3      | ?      |

---

## Combat
Combat is divided into rounds, where each player takes a turn. 
On a players turn, they can move or attack with up to 3 units. 
Mage powers are considered attacks for this purpose. If a unit is 
chosen to move/attack, it can move, attack or both in any order. 
It may not be picked again that round. When all of a side’s combat 
units are dead, their mages flee.



---
###Technologies Envisioned
+HTML5(HTML, CSS, Javascript)
+WinJS, Android, web browser, and maybe iOS.

####NOTES for Developers
Playtest for balance.
Contains native structures to handle images and positioning.

Things that could be  simplified
* If the bonuses for positioning are kept the hp and dmg numbers should be choosen to keep round ints
* The current hp and dmg of a unit should be hard coded as part of the sprite (add it in PS) and the sprite swapped out for the right hp lvl one
* Terrain should be left out until much later
* 
