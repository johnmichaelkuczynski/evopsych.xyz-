import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-50"
      initial={{ opacity: 0, y: '10vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="w-[40vw] h-[40vw] mb-[6vh] relative flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-slate-100"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/zhi-logo.png`}
          className="w-[60%] h-[60%] object-contain"
          alt="ZHI Systems Logo"
        />
      </motion.div>

      <motion.div
        className="text-center px-[8vw] flex flex-col items-center"
        initial={{ opacity: 0, y: '5vh' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-[8vw] font-bold text-slate-900 tracking-tight mb-[2vh]">
          ZHI Systems
        </h2>
        
        <p className="text-[5vw] text-slate-600 leading-relaxed font-medium">
          Customized certifications, courses, and apps for
        </p>

        <motion.div
          className="flex flex-wrap justify-center gap-[2vw] mt-[4vh]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2, delayChildren: 1.2 } }
          }}
        >
          {['Colleges', 'Individuals', 'Banks', 'Organizations'].map((tag) => (
            <motion.span
              key={tag}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="bg-slate-200 text-slate-800 px-[4vw] py-[1vh] rounded-full text-[4vw] font-semibold"
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-[8vh] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3 }}
      >
        <p className="text-[4vw] text-slate-400 font-medium">www.zhisystems.com</p>
      </motion.div>
    </motion.div>
  );
}