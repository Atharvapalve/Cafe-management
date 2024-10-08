'use client'

import { useState, useEffect } from 'react'
import { Coffee, Wallet, ShoppingCart, User, Menu, Plus, Minus, CreditCard, DollarSign, X, Mail, Phone, Edit, CheckCircle, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  name: string;
  price: number;
  rewardPoints: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  items: CartItem[];
  totalPrice: number;
  rewardPointsEarned: number;
  rewardPointsRedeemed: number;
}

export default function CafeManager() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('menu')
  const [balance, setBalance] = useState(1000)
  const [rewardPoints, setRewardPoints] = useState(100)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    favoriteCoffee: 'Espresso',
    preferredMilk: 'Oat',
    rewardsLevel: 'Gold'
  })
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [redeemPoints, setRedeemPoints] = useState(0)

  const menuItems: Record<string, MenuItem[]> = {
    beverages: [
      { name: 'Espresso', price: 120, rewardPoints: 10 },
      { name: 'Cappuccino', price: 150, rewardPoints: 15 },
      { name: 'Latte', price: 160, rewardPoints: 16 },
      { name: 'Mocha', price: 180, rewardPoints: 18 },
      { name: 'Americano', price: 130, rewardPoints: 13 },
      { name: 'Cold Brew', price: 200, rewardPoints: 20 },
    ],
    snacks: [
      { name: 'Croissant', price: 80, rewardPoints: 8 },
      { name: 'Muffin', price: 70, rewardPoints: 7 },
      { name: 'Sandwich', price: 150, rewardPoints: 15 },
    ],
    desserts: [
      { name: 'Cheesecake', price: 200, rewardPoints: 20 },
      { name: 'Tiramisu', price: 180, rewardPoints: 18 },
      { name: 'Brownie', price: 100, rewardPoints: 10 },
    ],
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoggedIn(true)
    setUsername(username)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
    setActiveTab('menu')
  }

  const handleAddFunds = (amount: number) => {
    setBalance(balance + amount)
    setShowAddFunds(false)
    toast({
      title: "Funds Added",
      description: `₹${amount} has been added to your wallet.`,
    })
  }

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.name === item.name)
    if (existingItem) {
      toast({
        title: "Item already in cart",
        description: "Use the + button to increase the quantity.",
      })
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
      toast({
        title: "Item added to cart",
        description: `${item.name} has been added to your cart.`,
      })
    }
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1
    } else {
      newCart.splice(index, 1)
    }
    setCart(newCart)
  }

  const incrementCartItem = (index: number) => {
    const newCart = [...cart]
    newCart[index].quantity += 1
    setCart(newCart)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalRewardPoints = () => {
    return cart.reduce((total, item) => total + item.rewardPoints * item.quantity, 0)
  }

  const handleCheckout = () => {
    const totalPrice = getTotalPrice() - (redeemPoints * 0.5)
    if (balance >= totalPrice) {
      const newBalance = balance - totalPrice
      const newRewardPoints = rewardPoints + getTotalRewardPoints() - redeemPoints
      setBalance(newBalance)
      setRewardPoints(newRewardPoints)
      setLastOrder({
        items: [...cart],
        totalPrice: totalPrice,
        rewardPointsEarned: getTotalRewardPoints(),
        rewardPointsRedeemed: redeemPoints
      })
      setCart([])
      setShowCheckout(false)
      setShowOrderConfirmation(true)
      setRedeemPoints(0)
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
      })
    } else {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to complete this order. Please add funds to your wallet.",
        variant: "destructive",
      })
    }
  }

  const handleContinueOrdering = () => {
    setShowOrderConfirmation(false)
    setActiveTab('menu')
  }

  const handleEditProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowEditProfile(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleRedeemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value)
    if (points <= rewardPoints && points >= 0) {
      setRedeemPoints(points)
    }
  }

  useEffect(() => {
    if (redeemPoints > getTotalPrice() * 2) {
      setRedeemPoints(getTotalPrice() * 2)
    }
  }, [redeemPoints, cart])

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#3C2A21]">
        <div className="w-full max-w-md bg-[#D5CEA3] p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-[#1A120B] mb-6">Cafe Manager Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-[#1A120B]">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-[#1A120B]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]">
              Log In
            </Button>
          </form>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-[#3C2A21] text-[#E5E5CB]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A120B] p-4">
        <div className="flex items-center justify-center mb-8">
          <Coffee className="h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold">Cafe Manager</h1>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === 'menu' ? 'bg-[#3C2A21]' : 'hover:bg-[#3C2A21]'
                }`}
                onClick={() => setActiveTab('menu')}
              >
                <Menu className="h-5 w-5 mr-2" />
                Menu
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === 'wallet' ? 'bg-[#3C2A21]' : 'hover:bg-[#3C2A21]'
                }`}
                onClick={() => setActiveTab('wallet')}
              >
                <Wallet className="h-5 w-5 mr-2" />
                Wallet
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === 'cart' ? 'bg-[#3C2A21]' : 'hover:bg-[#3C2A21]'
                }`}
                onClick={() => setActiveTab('cart')}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === 'profile' ? 'bg-[#3C2A21]' : 'hover:bg-[#3C2A21]'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">Reward Points: {rewardPoints}</span>
          </div>
        </header>

        {/* Menu content */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            {Object.entries(menuItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-2xl font-semibold mb-4 capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, index) => (
                    <div key={index} className="bg-[#D5CEA3] text-[#1A120B] p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-lg">₹{item.price}</p>
                      <p className="text-sm text-gray-600 mb-4">Reward Points: {item.rewardPoints}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromCart(cart.findIndex(cartItem => cartItem.name === item.name))}
                          disabled={!cart.some(cartItem => cartItem.name === item.name)}
                          className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">
                          {cart.find(cartItem => cartItem.name === item.name)?.quantity || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => incrementCartItem(cart.findIndex(cartItem => cartItem.name === item.name))}
                          disabled={!cart.some(cartItem => cartItem.name === item.name)}
                          className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        className="w-full bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet content */}
        {activeTab === 'wallet' && (
          <div className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Current Balance</h3>
            <p className="text-4xl font-bold mb-6">₹{balance}</p>
            {!showAddFunds ? (
              <Button
                variant="default"
                className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] flex items-center"
                onClick={() => setShowAddFunds(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </Button>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold">Select Payment Option</h4>
                <Button
                  variant="default"
                  className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] w-full flex items-center justify-center"
                  onClick={() => handleAddFunds(500)}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Add ₹500 via Card
                </Button>
                <Button
                  variant="default"
                  className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] w-full flex items-center justify-center"
                  onClick={() => handleAddFunds(1000)}
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Add ₹1000 via UPI
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowAddFunds(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cart content */}
        {activeTab === 'cart' && (
          <div className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Your Cart</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <ul className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{item.name} x{item.quantity} - ₹{item.price * item.quantity} (Reward Points: {item.rewardPoints * item.quantity})</span>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFromCart(index)}
                          className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => incrementCartItem(index)}
                          className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold">Total:</span>
                  <span className="text-xl font-bold">₹{getTotalPrice()} (Reward Points: {getTotalRewardPoints()})</span>
                </div>
                <Button
                  variant="default"
                  className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] w-full"
                  onClick={() => setShowCheckout(true)}
                >
                  Proceed to Checkout
                </Button>
              </>
            )}
          </div>
        )}

        {/* Profile content */}
        {activeTab === 'profile' && (
          <div className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-2xl font-semibold mb-4">User Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <User className="h-16 w-16" />
                <div>
                  <h4 className="text-xl font-semibold">{userProfile.name}</h4>
                  <p className="text-sm text-gray-600">Member since 2023</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{userProfile.phone}</span>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Preferences</h5>
                <ul className="list-disc list-inside">
                  <li>Favorite coffee: {userProfile.favoriteCoffee}</li>
                  <li>Preferred milk: {userProfile.preferredMilk}</li>
                  <li>Rewards member: {userProfile.rewardsLevel}</li>
                </ul>
              </div>
              <Button
                variant="default"
                className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] flex items-center"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="destructive"
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Checkout popup */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg max-w-md w-full">
          <h3 className="text-2xl font-semibold mb-4">Checkout</h3>
          <div className="space-y-4 mb-6">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Subtotal:</span>
            <span className="text-lg font-bold">₹{getTotalPrice()}</span>
          </div>
          <div className="mb-4">
            <Label htmlFor="redeemPoints" className="block text-sm font-medium text-[#1A120B] mb-1">
              Redeem Reward Points (max {Math.min(rewardPoints, getTotalPrice() * 2)})
            </Label>
            <Input
              type="number"
              id="redeemPoints"
              value={redeemPoints}
              onChange={handleRedeemPointsChange}
              min="0"
              max={Math.min(rewardPoints, getTotalPrice() * 2)}
              className="w-full"
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-xl font-bold">₹{getTotalPrice() - (redeemPoints * 0.5)}</span>
          </div>
          <p className="mb-6">Current balance: ₹{balance}</p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowCheckout(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
              onClick={handleCheckout}
            >
              Confirm Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Confirmation popup */}
      <Dialog open={showOrderConfirmation} onOpenChange={setShowOrderConfirmation}>
        <DialogContent className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 mr-2" />
            <h3 className="text-2xl font-semibold">Order Placed Successfully!</h3>
          </div>
          <div className="mb-6 space-y-2">
            <p>Thank you for your order. Your coffee will be ready shortly.</p>
            <p>Order Summary:</p>
            <ul className="list-disc list-inside pl-4">
              {lastOrder?.items.map((item, index) => (
                <li key={index}>{item.name} x{item.quantity} - ₹{item.price * item.quantity}</li>
              ))}
            </ul>
            <p className="font-semibold">Subtotal: ₹{lastOrder?.totalPrice && lastOrder.rewardPointsRedeemed ? lastOrder.totalPrice + (lastOrder.rewardPointsRedeemed * 0.5) : 0}</p>
            <p className="font-semibold">Reward Points Redeemed: {lastOrder?.rewardPointsRedeemed} (₹{lastOrder?.rewardPointsRedeemed ? lastOrder.rewardPointsRedeemed * 0.5 : 0})</p>
            <p className="font-semibold">Total: ₹{lastOrder?.totalPrice}</p>
            <p>New balance: ₹{balance}</p>
            <p>Reward Points earned: {lastOrder?.rewardPointsEarned}</p>
            <p>New Reward Points balance: {rewardPoints}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              variant="default"
              className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21] w-full"
              onClick={handleContinueOrdering}
            >
              Continue Ordering
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowOrderConfirmation(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile popup */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="bg-[#D5CEA3] text-[#1A120B] p-6 rounded-lg max-w-md w-full">
          <h3 className="text-2xl font-semibold mb-4">Edit Profile</h3>
          <form onSubmit={handleEditProfile} className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-[#1A120B]">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                value={userProfile.name}
                onChange={(e: { target: { value: any } }) => setUserProfile({ ...userProfile, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3C2A21] focus:ring focus:ring-[#3C2A21] focus:ring-opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-[#1A120B]">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={userProfile.email}
                onChange={(e: { target: { value: any } }) => setUserProfile({ ...userProfile, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3C2A21] focus:ring focus:ring-[#3C2A21] focus:ring-opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-[#1A120B]">
                Phone
              </Label>
              <Input
                type="tel"
                id="phone"
                value={userProfile.phone}
                onChange={(e: { target: { value: any } }) => setUserProfile({ ...userProfile, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3C2A21] focus:ring focus:ring-[#3C2A21] focus:ring-opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="favoriteCoffee" className="block text-sm font-medium text-[#1A120B]">
                Favorite Coffee
              </Label>
              <Input
                type="text"
                id="favoriteCoffee"
                value={userProfile.favoriteCoffee}
                onChange={(e: { target: { value: any } }) => setUserProfile({ ...userProfile, favoriteCoffee: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3C2A21] focus:ring focus:ring-[#3C2A21] focus:ring-opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="preferredMilk" className="block text-sm font-medium text-[#1A120B]">
                Preferred Milk
              </Label>
              <Input
                type="text"
                id="preferredMilk"
                value={userProfile.preferredMilk}
                onChange={(e: { target: { value: any } }) => setUserProfile({ ...userProfile, preferredMilk: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3C2A21] focus:ring focus:ring-[#3C2A21] focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="bg-[#1A120B] text-[#E5E5CB] hover:bg-[#3C2A21]"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}