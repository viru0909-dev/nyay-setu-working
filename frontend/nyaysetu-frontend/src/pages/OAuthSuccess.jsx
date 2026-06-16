import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function OAuthSuccess() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
   
    useEffect(() => {

        const token = searchParams.get('token');
    
        if (token) {
    
            try {
    
                const email = searchParams.get('email');
                const role = searchParams.get('role');
                const name = searchParams.get('name');
    
                const cleanRole = role?.replace("ROLE_", "");
    
                const user = {
                    email,
                    role: cleanRole,
                    name
                };
    
                
    
                setAuth(user, token);
    
                switch (cleanRole) {
    
                    case 'JUDGE':
                        navigate('/judge');
                        break;
    
                    case 'LAWYER':
                        navigate('/lawyer');
                        break;
    
                    case 'ADMIN':
                        navigate('/admin');
                        break;
    
                    case 'POLICE':
                        navigate('/police');
                        break;
    
                    case 'LITIGANT':
                    default:
                        navigate('/litigant');
                        break;
                }
    
            } catch (error) {
    
               
    
                navigate('/login');
            }
        }
    
    }, [searchParams, navigate, setAuth]);

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: 'bold'
            }}
        >
            Logging you in with Google...
        </div>
    );
}