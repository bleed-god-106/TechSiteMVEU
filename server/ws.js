// server/ws.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = function initWebSocket(server, db) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });
  const chatNS = io.of('/chat');

  chatNS.on('connection', socket => {
    console.log('🔌 WebSocket client connected:', socket.id);

    socket.on('joinSession', async ({ sessionId, token }) => {
      let isAdmin = false;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
          const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
          isAdmin = user && user.role === 'admin';
          console.log(`👤 User ${user?.name} (${isAdmin ? 'admin' : 'user'}) joined`);
        } catch (err) {
          console.error('JWT verify error:', err.message);
        }
      }
      
      if (isAdmin) {
        // Админы присоединяются к специальной комнате для админов
        socket.join('admins');
        console.log('👑 Admin joined admins room');
      }
      
      if (sessionId) {
        // Все (и админы, и пользователи) присоединяются к комнате сессии
        socket.join(`session_${sessionId}`);
        console.log(`💬 Socket joined session_${sessionId}`);
      }
    });

    socket.on('sendMessage', async ({ sessionId, content, token }) => {
      if (!sessionId || !content) {
        console.error('❌ Missing sessionId or content');
        return;
      }
      
      let author = 'Гость';
      let isAdmin = false;
      let user = null;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
          user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
          if (user) { 
            author = user.name; 
            isAdmin = user.role === 'admin'; 
          }
        } catch (err) {
          console.error('Error verifying token:', err.message);
        }
      }
      
      const newMessage = {
        _id: new ObjectId().toString(), // Убедимся что это строка
        type: isAdmin ? 'admin' : 'user',
        author: author,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log(`📝 Attempting to send message to session ${sessionId}:`, {
        type: newMessage.type,
        author: newMessage.author,
        contentLength: newMessage.content.length
      });

      // Используем правильное имя коллекции
      try {
        const result = await db.collection('chat_sessions').findOneAndUpdate(
          { _id: new ObjectId(sessionId) },
          { 
            $push: { messages: newMessage }, 
            $set: { 
              lastActivity: new Date().toISOString(),
              status: isAdmin ? 'active' : 'waiting'
            } 
          },
          { returnDocument: 'after', returnNewDocument: true }
        );
        
        if (result) {
          console.log(`✅ Message successfully saved to session ${sessionId}`);
          
          // Отправляем новое сообщение в комнату сессии и всем админам
          chatNS.to(`session_${sessionId}`).emit('newMessage', { sessionId, message: newMessage });
          chatNS.to('admins').emit('newMessage', { sessionId, message: newMessage });
          
          // Обновляем информацию о чате для админов
          chatNS.to('admins').emit('chatUpdated', result);
          
          console.log(`📤 Message broadcasted to session_${sessionId} and admins`);
        } else {
          console.error(`❌ Could not find session ${sessionId} in database`);
          
          // Попробуем найти сессию для диагностики
          const session = await db.collection('chat_sessions').findOne({ _id: new ObjectId(sessionId) });
          console.error(`🔍 Session lookup result:`, session ? 'Found' : 'Not found');
        }
      } catch (error) {
        console.error(`❌ Error updating session ${sessionId}:`, error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket client disconnected:', socket.id);
    });
  });
}; 