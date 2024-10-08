from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import MenuItem, Order, UserProfile
from .serializers import MenuItemSerializer, OrderSerializer, UserProfileSerializer, UserSerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=False, methods=['post'])
    def place_order(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        
        total_price = sum(item['price'] * item['quantity'] for item in request.data['items'])
        reward_points_earned = sum(item['reward_points'] * item['quantity'] for item in request.data['items'])
        reward_points_redeemed = request.data.get('reward_points_redeemed', 0)
        
        if profile.balance < total_price - (reward_points_redeemed * 0.5):
            return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
        if profile.reward_points < reward_points_redeemed:
            return Response({"error": "Insufficient reward points"}, status=status.HTTP_400_BAD_REQUEST)
        
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            reward_points_earned=reward_points_earned,
            reward_points_redeemed=reward_points_redeemed
        )
        
        for item in request.data['items']:
            menu_item = MenuItem.objects.get(id=item['id'])
            order.items.add(menu_item, through_defaults={'quantity': item['quantity']})
        
        profile.balance -= total_price - (reward_points_redeemed * 0.5)
        profile.reward_points += reward_points_earned - reward_points_redeemed
        profile.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    @action(detail=True, methods=['post'])
    def add_funds(self, request, pk=None):
        profile = self.get_object()
        amount = request.data.get('amount', 0)
        profile.balance += amount
        profile.save()
        return Response({"message": f"Added {amount} to balance"}, status=status.HTTP_200_OK)

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=request.data['password']
            )
            UserProfile.objects.create(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        return Response({"error": "Wrong Credentials"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({"success": "Successfully logged out"}, status=status.HTTP_200_OK)