# 起動方法

```plaintext
Calender % npx ts-node src/server.ts
```

とすると、

```plaintext
Server is running on port 3000
```

となるため、

```plaintext
% ngrok http 3000   
```

とし、表示されるURLをWebhookに登録する