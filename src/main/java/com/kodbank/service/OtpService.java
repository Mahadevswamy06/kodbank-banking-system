package com.kodbank.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {
    private Map<String, String> otpMap = new HashMap<>();

    public String generateOtp(String target) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpMap.put(target, otp);

        // In a real app, you would use an Email or SMS API here.
        System.out.println("DEBUG: Sending OTP " + otp + " to " + target);

        return otp;
    }

    public boolean validateOtp(String target, String otp) {
        return otp != null && otp.equals(otpMap.get(target));
    }

    public void clearOtp(String target) {
        otpMap.remove(target);
    }
}
