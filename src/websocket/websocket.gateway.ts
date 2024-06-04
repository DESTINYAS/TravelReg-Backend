import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WebsocketGateway.name);

    @WebSocketServer()
    server: Server;

    handleConnection(client: any, ...args: any[]): any {
        this.logger.log(`Client ${client.id} connected`);
      }
    
      handleDisconnect(client: any): any {
        this.logger.log(`Client ${client.id} disconnected`);
      }

  @SubscribeMessage('joinManifestUpdates')
  handleJoinManifestUpdates(client: any, data: any): void {
    this.logger.log(`Client ${client.id} subscribed to manifest updates`);
  }
}