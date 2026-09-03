import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-blue-950 overflow-hidden"
      initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: '-10vh' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full opacity-40"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/evopsych-home.jpg)`,
          backgroundSize: '150%',
          backgroundPosition: 'center 30%',
        }}
        initial={{ y: '10%' }}
        animate={{ y: '-10%' }}
        transition={{ duration: 6.5, ease: "linear" }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-slate-900/90 to-slate-950" />

      <div className="relative z-10 w-full px-[8vw] flex flex-col items-center">
        <motion.div
          className="w-full flex flex-col gap-[3vh] mb-[6vh]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2, delayChildren: 0.4 } }
          }}
        >
          {['Survival', 'Mating & Reproduction', 'Social Life', 'Culture'].map((topic, i) => (
            <motion.div
              key={topic}
              variants={{
                hidden: { opacity: 0, x: i % 2 === 0 ? '-10vw' : '10vw' },
                visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-[2vh] px-[5vw] flex items-center justify-between"
            >
              <span className="text-[5.5vw] font-semibold">{topic}</span>
              <span className="text-blue-400 text-[6vw]">→</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[5vw] text-slate-300 font-medium mb-[2vh]">Start learning today at</p>
          <div className="bg-blue-600 text-white px-[8vw] py-[2.5vh] rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.5)]">
            <h2 className="text-[7.5vw] font-bold tracking-tight">evopsych.xyz</h2>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}