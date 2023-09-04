import React, { useEffect, useState } from 'react';

interface User {
  user_id: string;
  image_count: number;
}

const Sidebar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Fetch users from backend
    // setUsers(fetchedUsers);
  }, []);
  
  return (
    <div>
    <h2>Users</h2>
    <ul>
    {users.map((user) => (
      <li key={user.user_id}>
      {user.user_id} - {user.image_count} images
      </li>
      ))}
      </ul>
      </div>
      );
    };
    
    export default Sidebar;
    