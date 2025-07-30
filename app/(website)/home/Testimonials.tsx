"use client"
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const testimonialsData = [
  {
    id: 1,
    text: "RMHSE is the best platform online where u can work online and earn money 😊Mein college student hu mere sare kharche yaha ki earning se purre hote hai bs 4-5 hours work karta hu best hai yeh platform aur sir aur ma'am ka support bhi bhut hai ❤, payment bhi time pr milta hai",
    name: "Aakash Mishra",
    image: "/akashImg.jpg",
    nameColor: "text-red-500",
    borderColor: "border-red-500",
  },
  {
    id: 2,
    text: "Thanks mam ♥ itna achha platform dene ke liye..Mai 2 months se work kar rha hu kaafi achha & genuine platform hai growup thankyou so much mam 🙏",
    name: "Saurabh Chautala",
    image: "/saurabhImg.jpg",
    nameColor: "text-purple-500",
    borderColor: "border-purple-500",
  },
  {
    id: 3,
    text: "Hi mera name aprajita h or mai ak student hu mai yha sturdy k sath work from home kam v karti hu ye ak aisha plate fome h jaha p aapko zero investment p kam diya jata h RMHSE company aap k life ko grow kr dege🤩🤩 ",
    name: "Aprajita",
    image: "/aprajitaImg.jpg",
    nameColor: "text-blue-500",
    borderColor: "border-blue-500",
  },
  {
    id: 4,
    text: "Thank you so much 🥰 sir & mam is plantform ko btane ke liye 😊Yaha sach me kaam krne ka paisa nahi lagta or GrowUp bahut hi accha plateform hai or work from home kam hai ye 💕 mere paise bahut gaye but ab paise ja nahi rahe balki yaha se kmai karke aa rahe hai😊Thank you GrowUp ❤",
    name: "Neha Wagde",
    image: "/nehaImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: 5,
    text: "First of all I am a student of bsc I grats my decision to join RMHSE ✅ for financial freedom 💰  I work here and according to my experience this is a greatest platform I ever found and the speciality of this platform there is no need to invest a single rupee 💯And now I am financially free with the help of group up company. Thanks alot Priya verma mam and gaurav sir❤",
    name: "Rohit Kumar",
    image: "/vishalImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: 6,
    text: "GrowUp is a wonderful 💯 company. You don't have to spend even a single 💰rupee to start work here. The support system here is very good. Payment is made on time. I'm very lucky 😍to be a part of this wonderful plateform. 😊 Thank you GrowUp ❤ ",
    name: "Bhawesh pandey",
    image: "bhaweshImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: 7,
    text: "🔹 Zero investment work hai, isme 💸 koi paisa nahi lagta.🔹 Main abhi 🎓 12th pass hoon aur mujhe isse bahut madad mili.🔹 Is kamai se 📱 maine naya phone bhi kharida hai because of this company ☺🔹 Ye ek 💯 genuine earning aur helpful opportunity hai!",
    name: "Rahul",
    image: "rahulImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: 8,
    text: "Thanks dear sir & ma'am ♥ itna achha platform dene ke liye..Mai 2 months se work kar rha hu GrowUp kaafi achha & genuine platform hai. Ye sach me bilkul ek genuine plateform hai jaha Bina Paisa lgaye paisa kamaya jata hai... or har month payment bhi timely di jati hai .Everything is perfect here ❤ 😊 you can start work without any investment and without any hesitation 💯✅thankyou so much GrowUp company🙏",
    name: "Vicky",
    image: "/vickyImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  },
  {
    id: 9,
    text: "GrowUp is really amazing plateform where you can earn money without any investment. Or yaha pe aapko koi product & course selling kaam bhi nhi Krna hota.. 💯 this is very genuine & trusting plateform ❤🌸 payment and yaha ka support or guidance system bhot accha ⭐hai...I'm feeling very proud to be a part of GrowUp company 😊❤🙏 Thank uh so much ❤",
    name: "Deepak Kumar",
    image: "/deepakImg.jpg",
    nameColor: "text-green-500",
    borderColor: "border-green-500",
  }
];

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; 
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
};

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [randomizedTestimonials, setRandomizedTestimonials] = useState<typeof testimonialsData>([]);

  useEffect(() => {
    setRandomizedTestimonials(shuffleArray(testimonialsData));
  }, []);

  useEffect(() => {
    if (randomizedTestimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % randomizedTestimonials.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [randomizedTestimonials.length]); 

  const goToSlide = (index:number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative max-w-7xl py-10 md:px-4" id='testimonial'>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center md:text-left max-w-xl mx-auto md:mx-0 mb-16 md:mb-20 md:ml-10">
          <p className="text-base font-semibold text-gray-500 uppercase tracking-widest mb-4">TESTIMONIALS</p>
          <h2 className="text-4xl md:text-5xl w-[280px] md:w-[400px] font-bold text-wrap mx-auto md:mx-0">
            <span className="bg-gradient-to-r from-black via-purple-400 via-40% to-pink-200 bg-clip-text text-transparent uppercase">What People Say </span>
            <span className=" bg-gradient-to-r from-black to-purple-400 bg-clip-text text-transparent uppercase">About Us.</span>
          </h2>
        </div>

        <div className="relative pb-16 mb-10">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out h-[460px]"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              
              {randomizedTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 md:mt-10 mx-auto py-10 z-10">
                  <div className="flex justify-center items-center pb-10">
                    <div className="relative max-w-xl w-full ">
                      <Image 
                      alt="testimonial blob"
                      src="/testimonial-blob2.png"
                      width={600}
                      height={430}
                      className='hidden lg:absolute lg:block lg:-top-[80px]  lg:left-0 h-auto w-[600px] z-0'
                  />
                      {/* Testimonial Card */}
                      <div className="relative flex flex-col justify-center md:-top-2  left-1/2 -translate-x-1/2 md:translate-x-0 md:left-16 bg-white/90  md:w-[460px] w-[360px] md:h-[250px] rounded-2xl shadow-md md:shadow-lg p-6 md:p-4 z-20 hover:shadow-xl transition-shadow duration-300">
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                          {testimonial.text}
                        </p>
                        <p className={`mt-3 font-bold ${testimonial.nameColor}`}>{testimonial.name}</p>
                        <div className="absolute -bottom-8 md:-bottom-12 left-1/2 lg:-bottom-16 md:left-1/2 transform -translate-x-1/2 ">
                        <Image 
                        alt='down arrow'
                        src="/arrow-down.png"
                        width={100}
                        height={100}
                        className='w-[40px] lg:w-[80px] h-auto object-contain'
                        />
                        </div>
                      </div>

                      {/* Profile Image */}
                      <div className="absolute left-1/2 -bottom-30 md:left-[290px] transform -translate-x-1/2 z-20 ">
                          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 bg-white ${testimonial.borderColor}`}>
                              <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                          </div>
                      </div>
                    </div>
                    
                    {/* The Pink Blob in the bg */}
                  
                  </div>
                </div>
                
              ))}
            </div>

          </div>
          
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {randomizedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gray-900 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;