import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from '../components/student/StudentLayout';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentProfile from '../components/student/StudentProfile';
import StudentEvaluation from '../components/student/StudentEvaluation';
import StudentCalendar from '../components/student/StudentCalendar';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/evaluation" element={<StudentEvaluation />} />
        <Route path="/calendar" element={<StudentCalendar />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
