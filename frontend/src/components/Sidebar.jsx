// Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

export const sidebarLinks = [
    { text: 'Services', path: '/' },
    { text: 'All CSAs', path: '/csas' },
    { text: 'Terms and Policy', path: '/terms' },
    { text: 'FAQ', path: '/faq' },
];

function Sidebar() {
    return (
        <aside style={{ width: '200px', padding: '10px', background: '#f0f8ff', boxShadow: '1px 1px 1px 1px #ddd', margin:'2px', border: '#ddd' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginLeft:"25px", marginTop:'30px' }}>
                {sidebarLinks.map((link, index) => (
                    <Link key={index} to={link.path} style={{ color: '#2E4053', textDecoration: 'none', fontWeight:'bold' }}>
                        {link.text}
                    </Link>
                ))}
            </div>
                {/* <div>
               <button style={{ display: 'block', margin: '10px 0' }}>Services</button>
               <button style={{ display: 'block', margin: '10px 0' }}>All CSAs</button>
               <button style={{ display: 'block', margin: '10px 0' }}>Other Option</button>
            </div> */}
        </aside>
    );
}

export default Sidebar;
