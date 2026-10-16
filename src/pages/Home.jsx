/**
 * Home.jsx – Page component for "/"
 * Practical 2: Distinct route component rendering Header, About, and Skills.
 */
import Header from '../components/Header';
import About  from '../components/About';
import Skills from '../components/Skills';

export default function Home({ student, themeColor, skillList }) {
  return (
    <main>
      <Header
        name={student.name}
        role="Computer Engineering Student & Aspiring Web Developer"
        description={`I'm ${student.name}, a passionate Computer Engineering student at ${student.institute}. I love building things for the web, exploring new technologies, and turning ideas into reality through clean, efficient code.`}
        themeColor={themeColor}
        github={student.github}
        linkedin={student.linkedin}
      />

      <About
        name={student.name}
        rollNo={student.rollNo}
        course={student.course}
        institute={student.institute}
        bio={`Hi there! I'm ${student.name}, currently pursuing a B.Tech in Computer Engineering at CSPIT, CHARUSAT University (Roll No: ${student.rollNo}). My passion lies in web technologies, software development, and solving real-world problems with code. I enjoy learning by building — every project is an opportunity to grow.`}
      />

      <Skills skillList={skillList} />
    </main>
  );
}
