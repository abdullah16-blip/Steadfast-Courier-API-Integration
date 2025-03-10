import { useState } from 'react';
import './App.css';

const API_BASE_URL = 'https://portal.packzy.com/api/v1';
const API_KEY = 'tzpqotob2yiba6ommahpfu2znfrtrsfi'; 
const SECRET_KEY = 'v81fis6oxlmmqx9cfd0dqle7'; 

function App() {
    const [trackingId, setTrackingId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState({
        invoice: '',
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        cod_amount: '',
        note: ''
    });
    const [balance, setBalance] = useState(null);

    
    const headers = {
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY,
        'Content-Type': 'application/json'
    };


    const trackParcel = async () => {
        if (!trackingId.trim()) {
            setError('Please enter a tracking ID');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/status_by_trackingcode/${trackingId}`, {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`Tracking Error: ${response.status} - ${errorText}`);
                throw new Error('Tracking request failed');
            }
            const data = await response.json();
            console.log('Tracking Response:', data);
            setTrackingData(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error fetching tracking details');
            setTrackingData(null);
        }
    };

    
    const placeOrder = async () => {
        const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount } = orderData;
        if (!invoice || !recipient_name || !recipient_phone || !recipient_address || cod_amount === '') {
            alert('Please fill in all required fields');
            return;
        }
        if (recipient_phone.length !== 11 || isNaN(recipient_phone)) {
            alert('Recipient phone must be an 11-digit number');
            return;
        }
        if (isNaN(cod_amount) || Number(cod_amount) < 0) {
            alert('COD amount must be a non-negative number');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/create_order`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`Order Error: ${response.status} - ${errorText}`);
                throw new Error('Order creation failed');
            }
            const data = await response.json();
            console.log('Full Order Response:', data); // Log full response for debugging

            
            const trackingCode = data.consignment?.tracking_code || data.tracking_code || data.tracking || 'Not provided';
            alert(`${data.message || 'Order placed successfully'} Tracking Code: ${trackingCode}`);
            if (trackingCode && trackingCode !== 'Not provided') {
                setTrackingId(trackingCode); // Only set if valid
            }
            setOrderData({
                invoice: '',
                recipient_name: '',
                recipient_phone: '',
                recipient_address: '',
                cod_amount: '',
                note: ''
            });
        } catch (err) {
            alert(err.message || 'Error placing order');
        }
    };

    
    const checkBalance = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_balance`, {
                method: 'GET',
                headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`Balance Error: ${response.status} - ${errorText}`);
                throw new Error('Balance request failed');
            }
            const data = await response.json();
            console.log('Balance Response:', data);
            setBalance(data.current_balance);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error fetching balance');
            setBalance(null);
        }
    };

    return (
        <div className="container">
            <h1>Steadfast Courier Services</h1>

            {/* Track Parcel Section */}
            <div className="section">
                <h2>Track Parcel</h2>
                <input
                    type="text"
                    placeholder="Enter Tracking ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                />
                <button onClick={trackParcel}>Track</button>
                {error && <p className="error">{error}</p>}
                {trackingData && (
                    <div className="tracking-details">
                        <h3>Tracking Details</h3>
                        <pre>{JSON.stringify(trackingData, null, 2)}</pre>
                    </div>
                )}
            </div>

            {/* Place Order Section */}
            <div className="section">
                <h2>Place Order</h2>
                {[
                    { field: 'invoice', label: 'Invoice', type: 'text' },
                    { field: 'recipient_name', label: 'Recipient Name', type: 'text' },
                    { field: 'recipient_phone', label: 'Recipient Phone', type: 'text' },
                    { field: 'recipient_address', label: 'Recipient Address', type: 'text' },
                    { field: 'cod_amount', label: 'COD Amount', type: 'number' },
                    { field: 'note', label: 'Note (Optional)', type: 'text' }
                ].map(({ field, label, type }) => (
                    <input
                        key={field}
                        type={type}
                        placeholder={label}
                        value={orderData[field]}
                        onChange={(e) => setOrderData({ ...orderData, [field]: e.target.value })}
                    />
                ))}
                <button onClick={placeOrder}>Submit Order</button>
            </div>

            {/* Check Balance Section */}
            <div className="section">
                <h2>Check Balance</h2>
                <button onClick={checkBalance}>Check Balance</button>
                {balance !== null && <p>Current Balance: {balance} BDT</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

export default App;