import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { imageMap } from '../../data'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

// Components
import Home from './pages/Home'
import CabResults from './pages/CabResults'
import CabDetails from './pages/CabDetails'
import CheckoutForm from './pages/CheckoutForm'
import Success from './pages/Success'
import Profile from './pages/Profile'
import Bookings from './pages/Bookings'
import BottomNav from './components/BottomNav'
import EditProfile from './pages/EditProfile'
import ManageAddress from './pages/ManageAddress'
import Notifications from './pages/Notifications'
import CustomerProtectedRoute from './components/CustomerProtectedRoute'
import { Terms, Privacy, Support } from './pages/StaticPages'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import AirportInfo from './pages/AirportInfo'
import CustomerLogin from './components/CustomerLogin'

function UserModule() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Home Form States
  const [activeService, setActiveService] = useState('airport')
  const [airportMode, setAirportMode] = useState('pickup')
  const [location, setLocation] = useState('Fetching live location...')
  const [dropLocation, setDropLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('')
  const [outstationMode, setOutstationMode] = useState('oneway')
  const [returnDate, setReturnDate] = useState('')

  // User States
  const [selectedCab, setSelectedCab] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  // API States
  const [quoteId, setQuoteId] = useState(null)
  const [cabResults, setCabResults] = useState([])
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  
  // Fleet States
  const [globalCategories, setGlobalCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      setIsApplyingCoupon(true);
      const fare = parseInt(selectedCab.price.replace('₹', ''));
      const res = await api.post('/coupons/validate', { 
        code: couponCode, 
        orderValue: fare 
      });

      if (res && res.data) {
        const coupon = res.data;
        let discount = 0;
        if (coupon.type === 'percentage') {
          discount = Math.floor((fare * coupon.value) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.value;
        }

        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
        alert(`Coupon Applied! You saved ₹${discount}`);
      }
    } catch (err) {
      console.error('Coupon error:', err);
      alert(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const fetchGlobalCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const res = await api.get('/vehicle-categories');
      if (res && res.data) {
        setGlobalCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch global categories:', err);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => setIsRazorpayLoaded(false);
    document.body.appendChild(script);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
            try {
              // Using OpenStreetMap (Nominatim) - FREE Alternative to Google Maps
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                headers: {
                  'User-Agent': 'NammaTaxiApp/1.0'
                }
              });
              const data = await response.json();
              
              if (data && data.display_name) {
                // Shorten the address for better UI (taking first 3 parts)
                const parts = data.display_name.split(',');
                const shortAddress = parts.slice(0, 3).join(',').trim();
                setLocation(shortAddress);
              } else {
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS Location)`);
              }
            } catch (err) {
              console.error("Nominatim Geocoding error:", err);
              setLocation('Bengaluru, Karnataka (Auto-detected)');
            }
        },
        (error) => {
          console.error("Location error:", error);
          setLocation('MG Road, Bengaluru, India');
        }
      );
    } else {
      setLocation('MG Road, Bengaluru, India');
    }

    fetchGlobalCategories();
  }, [])

  const handleSearch = async () => {
    try {
      // Validation for distance-based services
      if (activeService === 'airport' || activeService === 'outstation' || activeService === 'local') {
        if (!location || location === 'Fetching live location...') {
          alert('Please enter a pickup location');
          return;
        }
        if (!dropLocation || dropLocation.trim() === '') {
          alert('Please enter a destination');
          return;
        }
      }

      // setIsLoadingResults(true)
      // setApiError('')
      
      const tripMode = activeService === 'airport' ? airportMode : 
                       activeService === 'outstation' ? outstationMode : 
                       activeService === 'local' ? 'city_ride' :
                       (selectedPackage || '1day_450km_arunachalam')

      const quoteData = {
        serviceType: activeService,
        tripMode,
        pickupLocation: location,
        dropLocation: dropLocation, // Real value only
        pickupDate: pickupDate || new Date().toISOString().split('T')[0],
        pickupTime: pickupTime || '10:00',
        returnDate,
        phoneNumber
      }

      const res = await api.post('/quotes', quoteData)
      
      // Log search history for analytics (Fire and forget)
      api.post('/search-history/log', {
        pickup: location,
        drop: dropLocation,
        category: activeService === 'airport' ? 'BANGALORE_AIRPORT' : 'NAMMATAXI',
        userId: user?._id
      }).catch(err => console.error('Search log failed:', err));
      
      if (res && res.data) {
        setQuoteId(res.data._id)
        /* setQuoteMetadata({
          distanceKm: res.data.distanceKm,
          estimatedDuration: res.data.estimatedDuration,
          quoteSource: res.data.quoteSource
        }) */
        
        // Map backend response to the shape CabResults expects
        const mappedCabs = res.data.availableCategories.map(cat => ({
          id: cat.vehicleCategoryId,
          name: cat.categoryName,
          brand: cat.seats > 4 ? 'SUV' : 'Sedan', // simple fallback
          seats: cat.seats,
          luggage: cat.luggage,
          ac: cat.ac,
          price: `₹${cat.computedFare}`,
          img: imageMap[cat.image] || imageMap['service_airport-removebg-preview - Copy.png'],
          desc: `${cat.seats} Seater, ${cat.ac ? 'AC' : 'Non-AC'} | Base fare: ₹${cat.breakdown.baseFare}`,
          distanceKm: res.data.distanceKm,
          estimatedDuration: res.data.estimatedDuration
        }))
        
        setCabResults(mappedCabs)
        navigate('/user/results')
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err)
      // setApiError(err.message || 'Failed to get quotes. Please try again.')
      alert(err.message || 'Failed to get quotes.')
    } finally {
      // setIsLoadingResults(false)
    }
  }

  const handleBookClick = async () => {
    if (!window.Razorpay || !isRazorpayLoaded) {
      alert('Payment gateway is still loading or unavailable. Please try again in a moment.');
      return;
    }

    setIsCheckingAvailability(true)
    
    try {
      // 1. Create Booking
      if (!selectedCab) {
        alert('Selection error: Please select a vehicle category again.');
        setIsCheckingAvailability(false);
        return;
      }

      const bookingData = {
        quoteId,
        categoryId: selectedCab._id || selectedCab.id,
        couponCode: appliedCoupon?.code || null,
        customerInfo: {
          name: userName || 'Guest User',
          phone: phoneNumber || '9999999999',
          email: userEmail || 'guest@example.com',
          address: userAddress || 'Bengaluru'
        }
      }

      const bookingRes = await api.post('/bookings', bookingData)
      if (!bookingRes || !bookingRes.data) throw new Error('Failed to create booking');
      
      const bookingId = bookingRes.data._id;
      const bookingRef = bookingRes.data.bookingRef;

      // 2. Initiate Payment
      // Pass phone for guest ownership verification on backend
      const paymentRes = await api.post('/payments/initiate', { bookingId, phone: phoneNumber });
      if (!paymentRes || !paymentRes.data) throw new Error('Failed to initiate payment');
      
      const { orderId, amount, currency, key } = paymentRes.data;

      // 3. Open Razorpay Checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Namma Taxi',
        description: `Booking ${bookingRef}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // 4. Verify Payment on Backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });

            if (verifyRes && verifyRes.data) {
              setSelectedCab({
                ...selectedCab,
                bookingRef: bookingRef
              })
              // Reset coupon states
              setAppliedCoupon(null);
              setCouponCode('');
              setDiscountAmount(0);
              navigate('/user/success')
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: phoneNumber
        },
        theme: {
          color: '#F7DC9D'
        },
        modal: {
          ondismiss: () => {
            setIsCheckingAvailability(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        console.error('Payment failed:', response.error);
        await api.post('/payments/failure', {
          orderId: orderId,
          error: response.error
        });
        alert(`Payment failed: ${response.error.description}`);
        setIsCheckingAvailability(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Failed to complete booking process:', err)
      alert(err.message || 'Failed to complete booking. Please try again.')
      setIsCheckingAvailability(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route index element={
          <Home 
            activeService={activeService}
            setActiveService={setActiveService}
            airportMode={airportMode}
            setAirportMode={setAirportMode}
            location={location}
            setLocation={setLocation}
            dropLocation={dropLocation}
            setDropLocation={setDropLocation}
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            pickupTime={pickupTime}
            setPickupTime={setPickupTime}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            outstationMode={outstationMode}
            setOutstationMode={setOutstationMode}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            handleSearch={handleSearch}
            globalCategories={globalCategories}
          />
        } />
        
        <Route path="results" element={
          <CabResults 
            cabs={cabResults} 
            setView={(view) => navigate(view === 'home' ? '/user' : `/user/${view}`)} 
            setSelectedCab={setSelectedCab} 
          />
        } />

        <Route path="details" element={
          <CabDetails 
            selectedCab={selectedCab} 
            setView={(view) => navigate(view === 'results' ? '/user/results' : `/user/${view}`)} 
            location={location}
            dropLocation={dropLocation}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
          />
        } />

        <Route path="checkout" element={
          <CheckoutForm 
            selectedCab={selectedCab}
            setView={(view) => navigate(view === 'details' ? '/user/details' : `/user/${view}`)}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            phoneNumber={phoneNumber}
            userAddress={userAddress}
            setUserAddress={setUserAddress}
            handleBookClick={handleBookClick}
            isCheckingAvailability={isCheckingAvailability}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmount}
            handleApplyCoupon={handleApplyCoupon}
            isApplyingCoupon={isApplyingCoupon}
          />
        } />

        <Route path="success" element={
          <Success 
            selectedCab={selectedCab} 
            setView={() => navigate('/user')} 
          />
        } />

        <Route path="bookings" element={<CustomerProtectedRoute><Bookings /></CustomerProtectedRoute>} />
        <Route path="profile" element={<CustomerProtectedRoute><Profile /></CustomerProtectedRoute>} />
        <Route path="edit-profile" element={<CustomerProtectedRoute><EditProfile /></CustomerProtectedRoute>} />
        <Route path="manage-address" element={<CustomerProtectedRoute><ManageAddress /></CustomerProtectedRoute>} />
        <Route path="notifications" element={<CustomerProtectedRoute><Notifications /></CustomerProtectedRoute>} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="support" element={<Support />} />
        <Route path="blog" element={<BlogList />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="airport-info" element={<AirportInfo />} />
        <Route path="login" element={<CustomerLogin />} />
      </Routes>

      {/* Global Spacer */}
      <div className="h-44"></div>

      <BottomNav />
    </div>
  )
}

export default UserModule;
