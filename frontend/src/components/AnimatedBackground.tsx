export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
      {/* Spinning circles */}
      <div className="absolute w-64 h-64 border-4 border-white rounded-full top-10 -left-32 animate-spin" style={{ animationDuration: '20s' }}></div>
      <div className="absolute w-96 h-96 border-4 border-white rounded-full top-40 right-20" style={{ animation: 'spin 15s linear infinite reverse' }}></div>
      <div className="absolute w-48 h-48 border-4 border-white rounded-full bottom-20 left-1/4" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
      <div className="absolute w-72 h-72 border-4 border-white rounded-full bottom-40 right-1/3 animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      {/* Hexagon patterns */}
      <svg className="absolute top-1/4 left-1/3 w-32 h-32" style={{ animation: 'float 8s ease-in-out infinite' }} viewBox="0 0 100 100">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="2"/>
      </svg>
      <svg className="absolute bottom-1/3 right-1/4 w-24 h-24 animate-spin" style={{ animationDuration: '25s' }} viewBox="0 0 100 100">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="2"/>
      </svg>
      
      {/* Diagonal lines */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 -translate-x-32" style={{ animation: 'slideRight 8s linear infinite' }}></div>
        <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 translate-x-32" style={{ animation: 'slideRight 8s linear infinite', animationDelay: '2s' }}></div>
        <div className="absolute w-1 h-full bg-white opacity-10 transform rotate-45 translate-x-96" style={{ animation: 'slideRight 8s linear infinite', animationDelay: '4s' }}></div>
      </div>
    </div>
  )
}
