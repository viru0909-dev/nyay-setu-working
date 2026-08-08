package com.nyaysetu.backend.forensics.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.forensics.entity.AccidentCase;
import com.nyaysetu.backend.forensics.repository.AccidentCaseRepository;
import com.nyaysetu.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForensicsServicePathTraversalTest {

    @Mock
    private AccidentCaseRepository accidentCaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    private ForensicsService forensicsService;

    @TempDir
    private Path tempDir;

    @BeforeEach
    void setUp() {
        forensicsService = new ForensicsService(
                accidentCaseRepository,
                userRepository,
                objectMapper
        );
        ReflectionTestUtils.setField(forensicsService, "UPLOAD_DIR", tempDir.toString() + "/forensics/");
    }

    @Test
    void testNormalFilenameUploadSucceeds() throws IOException {
        String username = "test@example.com";
        User mockUser = User.builder().id(1L).email(username).build();
        AccidentCase savedCase = AccidentCase.builder().id(UUID.randomUUID()).build();

        when(userRepository.findByEmail(username)).thenReturn(Optional.of(mockUser));
        when(accidentCaseRepository.save(any(AccidentCase.class))).thenReturn(savedCase);

        byte[] content = "test video content".getBytes();
        MultipartFile videoFile = createMockMultipartFile("evidence.mp4", content);

        UUID jobId = forensicsService.initializeAnalysis(List.of(videoFile), "Test description", username);

        assertNotNull(jobId);
        File[] files = tempDir.resolve("forensics").toFile().listFiles();
        assertNotNull(files);
        assertEquals(1, files.length);

        File savedFile = files[0];
        assertEquals(tempDir.resolve("forensics").toRealPath(), savedFile.getParentFile().toPath().toRealPath());
        assertFalse(savedFile.getName().contains("../"));
        assertTrue(savedFile.getName().endsWith("evidence.mp4"));
    }

    @Test
    void testTraversalFilenamesAreSanitized() throws IOException {
        String username = "test@example.com";
        User mockUser = User.builder().id(1L).email(username).build();
        AccidentCase savedCase = AccidentCase.builder().id(UUID.randomUUID()).build();

        when(userRepository.findByEmail(username)).thenReturn(Optional.of(mockUser));
        when(accidentCaseRepository.save(any(AccidentCase.class))).thenReturn(savedCase);

        List<String> originals = List.of("../../../tmp/evil.mp4", "a/../../../tmp/evil.mp4", "..\\..\\tmp\\evil.mp4");
        byte[] content = "malicious video".getBytes();

        for (String originalFilename : originals) {
            MultipartFile videoFile = createMockMultipartFile(originalFilename, content);
            UUID jobId = forensicsService.initializeAnalysis(List.of(videoFile), "Test", username);
            assertNotNull(jobId, "Upload should succeed for " + originalFilename);
        }

        File[] files = tempDir.resolve("forensics").toFile().listFiles();
        assertNotNull(files);
        assertEquals(originals.size(), files.length);

        for (File savedFile : files) {
            assertEquals(tempDir.resolve("forensics").toRealPath(), savedFile.getParentFile().toPath().toRealPath());
            assertFalse(savedFile.getName().contains(".."), "Stored filename must not contain path traversal");
            assertFalse(savedFile.getName().contains("/"));
            assertFalse(savedFile.getName().contains("\\"));
            assertTrue(savedFile.getName().endsWith("evil.mp4"));
        }
    }

    private MultipartFile createMockMultipartFile(String originalFilename, byte[] content) throws IOException {
        MultipartFile mock = mock(MultipartFile.class);
        when(mock.getOriginalFilename()).thenReturn(originalFilename);
        when(mock.getInputStream()).thenReturn(new ByteArrayInputStream(content));
        return mock;
    }
}
