package com.blog.socket.rest;

import java.util.List;

public interface SubscriptionManager {
   List<String> match(MatchRequest request);
   void subscribe(SubscribeRequest request);
   void renew(RenewRequest request);
}
