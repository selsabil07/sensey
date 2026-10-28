import React from 'react'
import { GraduationCap, MonitorSmartphone, ShieldCheck, UserRound } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: "Quality Edzcation",
    description:
      "Learn from carefully prepared courses designed to help you build valuable skills.",
    color: "bg-orange-50 text-[#fe5933]",
  },
  {
    icon: UserRound,
    title: "Student-Focused",
    description:
      "Explore learning opportunities and progress at a pace that works for you.",
    color: "bg-blue-50 text-[#4776e6]",
  },
  {
    icon: MonitorSmartphone,
    title: "Learn Anywhere",
    description:
      "Access your learning experience from your laptop, tablet, or mobile device.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ShieldCheck,
    title: "A Supportive Space",
    description:
      "Enjoy an organized learning environment built around students and teachers.",
    color: "bg-purple-50 text-purple-600",
  },
];


const Why = () => {
  return (
    <div>
    <section id="about" className="border-y border-slate-100 bg-slate-50/80">
    <div className='m-2 p-3 text-center'>
        <h2 className=' text-3xl font-extrabold tracking-tight sm:text-4xl'>
            Why sensey ?
        </h2>
        <span className=' max-w-xl text-sm leading-6 text-slate-600 sm:text-base'>
            This why sensey is better
        </span>
    </div>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="text-center">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                >
                  <Icon size={27} />
                </div>
                <h2 className="mt-4 font-bold">{feature.title}</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

    </div>
  )
}

export default Why