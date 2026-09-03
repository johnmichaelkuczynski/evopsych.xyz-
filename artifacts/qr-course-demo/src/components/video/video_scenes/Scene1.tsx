import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/evopsych-home.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
        initial={{ scale: 1.2, y: '5vh' }}
        animate={{ scale: 1.05, y: '-5vh' }}
        transition={{ duration: 8.5, ease: "linear" }}
      />
      
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

      <motion.div
        className="relative z-10 w-[85vw] h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        initial={{ y: '20vh', opacity: 0, rotateX: 15 }}
        animate={{ y: '0vh', opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000 }}
      >
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/evopsych-home.jpg`}
          className="w-full h-auto object-cover object-top"
          initial={{ y: 0 }}
          animate={{ y: '-10%' }}
          transition={{ duration: 8.5, ease: "linear" }}
        />
      </motion.div>

      <motion.div 
        className="absolute bottom-[10vh] w-full flex flex-col items-center z-30 px-[5vw] text-center"
        initial={{ opacity: 0, y: '5vh' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-[7.5vw] font-bold tracking-tight leading-tight mb-[1vh] drop-shadow-lg">
          PhD in <br />
          <span className="text-blue-400">Evolutionary<br />Psychology?</span>
        </h1>
        <motion.div 
          className="bg-white/10 backdrop-blur-md px-[6vw] py-[1.5vh] rounded-full border border-white/20 mt-[2vh]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 5.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[4.5vw] font-medium tracking-wide">Start at <span className="font-bold text-white">evopsych.xyz</span></p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}