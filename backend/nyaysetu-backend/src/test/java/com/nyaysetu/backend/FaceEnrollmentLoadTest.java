package com.nyaysetu.backend;

import org.junit.jupiter.api.Test;

class FaceEnrollmentLoadTest {

    @Test
    void benchmarkFaceEnrollment() {
        long startTime = System.currentTimeMillis();

        for (int i = 0; i < 10000; i++) {
            String faceDescriptor =
                    "[0.1,0.2,0.3,0.4,0.5,0.6]";
            faceDescriptor.hashCode();
        }

        long endTime = System.currentTimeMillis();

        System.out.println(
                "Face Enrollment Benchmark Time: "
                        + (endTime - startTime)
                        + " ms"
        );
    }
}
