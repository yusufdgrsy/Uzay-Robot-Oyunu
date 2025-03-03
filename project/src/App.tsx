import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Zap, RotateCcw, Crosshair } from 'lucide-react';

// Game types
type Robot = {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  energy: number;
  maxEnergy: number;
  x: number;
  y: number;
  color: string;
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  sourceId: number;
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [projectileId, setProjectileId] = useState(0);
  const [gameMessage, setGameMessage] = useState("Uzay Savaşı'na hoş geldiniz!");

  // Initialize game
  const startGame = () => {
    const initialRobots: Robot[] = [
      {
        id: 1,
        name: "Astro-X",
        health: 100,
        maxHealth: 100,
        attack: 20,
        defense: 10,
        energy: 100,
        maxEnergy: 100,
        x: 100,
        y: 300,
        color: "#FF5733"
      },
      {
        id: 2,
        name: "Nebula-7",
        health: 120,
        maxHealth: 120,
        attack: 15,
        defense: 15,
        energy: 100,
        maxEnergy: 100,
        x: 700,
        y: 300,
        color: "#3498DB"
      }
    ];
    
    setRobots(initialRobots);
    setGameStarted(true);
    setWinner(null);
    setProjectiles([]);
    setGameMessage("Savaş başladı! Robotlardan birini seçin.");
  };

  // Handle robot selection
  const selectRobot = (robot: Robot) => {
    if (winner) return;
    setSelectedRobot(robot);
    setGameMessage(`${robot.name} seçildi. Saldırı için hedef robota tıklayın.`);
  };

  // Handle attack
  const attackRobot = (targetRobot: Robot) => {
    if (!selectedRobot || selectedRobot.id === targetRobot.id || selectedRobot.energy < 20) {
      return;
    }

    // Create a new projectile
    const newProjectile: Projectile = {
      id: projectileId,
      x: selectedRobot.x,
      y: selectedRobot.y,
      targetX: targetRobot.x,
      targetY: targetRobot.y,
      speed: 5,
      damage: selectedRobot.attack,
      sourceId: selectedRobot.id
    };

    // Update energy
    const updatedRobots = robots.map(robot => {
      if (robot.id === selectedRobot.id) {
        return { ...robot, energy: robot.energy - 20 };
      }
      return robot;
    });

    setRobots(updatedRobots);
    setProjectiles([...projectiles, newProjectile]);
    setProjectileId(prevId => prevId + 1);
    setSelectedRobot(null);
    setGameMessage(`${selectedRobot.name} saldırıyor!`);
  };

  // Recharge robot energy
  const rechargeEnergy = (robot: Robot) => {
    if (winner) return;
    
    const updatedRobots = robots.map(r => {
      if (r.id === robot.id) {
        return { ...r, energy: Math.min(r.maxEnergy, r.energy + 30) };
      }
      return r;
    });
    
    setRobots(updatedRobots);
    setSelectedRobot(null);
    setGameMessage(`${robot.name} enerji yükledi.`);
  };

  // Game loop
  useEffect(() => {
    if (!gameStarted || winner) return;

    const gameLoop = setInterval(() => {
      // Move projectiles and check for hits
      setProjectiles(prevProjectiles => {
        const remainingProjectiles = prevProjectiles.filter(projectile => {
          // Calculate direction vector
          const dx = projectile.targetX - projectile.x;
          const dy = projectile.targetY - projectile.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If projectile reached target
          if (distance < 10) {
            // Apply damage to target robot
            setRobots(prevRobots => {
              const updatedRobots = prevRobots.map(robot => {
                if (robot.x === projectile.targetX && robot.y === projectile.targetY) {
                  const damage = Math.max(5, projectile.damage - robot.defense / 2);
                  const newHealth = Math.max(0, robot.health - damage);
                  
                  if (newHealth === 0) {
                    // Check for game over
                    const sourceRobot = prevRobots.find(r => r.id === projectile.sourceId);
                    if (sourceRobot) {
                      setWinner(sourceRobot.name);
                      setGameMessage(`${sourceRobot.name} kazandı!`);
                    }
                  }
                  
                  return { ...robot, health: newHealth };
                }
                return robot;
              });
              
              return updatedRobots;
            });
            
            return false; // Remove projectile
          }
          
          // Move projectile towards target
          const moveX = (dx / distance) * projectile.speed;
          const moveY = (dy / distance) * projectile.speed;
          
          projectile.x += moveX;
          projectile.y += moveY;
          
          return true; // Keep projectile
        });
        
        return remainingProjectiles;
      });
      
      // Check if only one robot remains
      if (robots.filter(robot => robot.health > 0).length <= 1) {
        const lastRobot = robots.find(robot => robot.health > 0);
        if (lastRobot) {
          setWinner(lastRobot.name);
          setGameMessage(`${lastRobot.name} kazandı!`);
        }
      }
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameStarted, robots, winner]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <Rocket className="mr-2" /> Uzay Robotları Savaşı
        </h1>
        <div>
          {!gameStarted ? (
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center"
            >
              <Zap className="mr-2" /> Oyunu Başlat
            </button>
          ) : (
            <button 
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md flex items-center"
            >
              <RotateCcw className="mr-2" /> Yeniden Başlat
            </button>
          )}
        </div>
      </header>

      {/* Game message */}
      <div className="bg-gray-800 p-2 text-center">
        <p className="text-lg">{gameMessage}</p>
      </div>

      {/* Game area */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Stars background */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite`
              }}
            />
          ))}
        </div>

        {/* Game elements */}
        {gameStarted && (
          <>
            {/* Robots */}
            {robots.map(robot => (
              <div 
                key={robot.id}
                className={`absolute transition-transform ${selectedRobot?.id === robot.id ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ 
                  left: robot.x - 30, 
                  top: robot.y - 30,
                  opacity: robot.health > 0 ? 1 : 0.3,
                  transform: selectedRobot?.id === robot.id ? 'scale(1.1)' : 'scale(1)'
                }}
                onClick={() => {
                  if (robot.health <= 0) return;
                  
                  if (selectedRobot && selectedRobot.id !== robot.id) {
                    attackRobot(robot);
                  } else {
                    selectRobot(robot);
                  }
                }}
              >
                {/* Robot body */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center relative"
                  style={{ backgroundColor: robot.color }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-50"></div>
                  <Rocket size={24} />
                  
                  {/* Health bar */}
                  <div className="absolute -top-6 left-0 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${(robot.health / robot.maxHealth) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Energy bar */}
                  <div className="absolute -bottom-6 left-0 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(robot.energy / robot.maxEnergy) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Robot name */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap">
                  {robot.name}
                </div>
                
                {/* Actions menu */}
                {selectedRobot?.id === robot.id && (
                  <div className="absolute -right-16 top-0 bg-gray-800 bg-opacity-80 p-1 rounded-md">
                    <button 
                      className="block p-1 hover:bg-gray-700 rounded mb-1 text-yellow-400"
                      title="Saldır (20 enerji)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGameMessage("Saldırmak için hedef robotu seçin");
                      }}
                    >
                      <Crosshair size={16} />
                    </button>
                    <button 
                      className="block p-1 hover:bg-gray-700 rounded text-blue-400"
                      title="Enerji Yükle"
                      onClick={(e) => {
                        e.stopPropagation();
                        rechargeEnergy(robot);
                      }}
                    >
                      <Zap size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Projectiles */}
            {projectiles.map(projectile => (
              <div 
                key={projectile.id}
                className="absolute w-3 h-3 bg-yellow-500 rounded-full"
                style={{ 
                  left: projectile.x - 1.5, 
                  top: projectile.y - 1.5,
                  boxShadow: '0 0 8px 2px rgba(255, 255, 0, 0.6)'
                }}
              />
            ))}
          </>
        )}
        
        {/* Game over overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold mb-4">{winner} Kazandı!</div>
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-lg"
            >
              Yeniden Oyna
            </button>
          </div>
        )}
        
        {/* Start screen */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold mb-6">Uzay Robotları Savaşı</h1>
            <p className="text-xl mb-8 max-w-md text-center">
              İnsansız robotların uzay boşluğunda savaştığı bu heyecan verici oyuna hoş geldiniz!
            </p>
            <button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-xl flex items-center"
            >
              <Rocket className="mr-2" /> Oyunu Başlat
            </button>
          </div>
        )}
      </div>
      
      {/* Game instructions */}
      {gameStarted && !winner && (
        <div className="bg-gray-800 p-3">
          <h3 className="font-bold mb-1">Nasıl Oynanır:</h3>
          <ul className="text-sm">
            <li className="flex items-center mb-1">
              <Rocket size={14} className="mr-1" /> Bir robot seçin
            </li>
            <li className="flex items-center mb-1">
              <Crosshair size={14} className="mr-1" /> Saldırmak için rakip robota tıklayın (20 enerji harcar)
            </li>
            <li className="flex items-center">
              <Zap size={14} className="mr-1" /> Enerji yüklemek için enerji butonuna tıklayın
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;