package com.cristianml.TomeVault.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "books")
public class BookEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "google_book_id", nullable = false)
    private String googleBookId;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, length = 1000)
    private String author;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(length = 1000)
    private String thumbnail;

    @ElementCollection
    @CollectionTable(name = "book_tags", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "tag")
    private List<String> tags;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "added_at")
    private LocalDate addedAt;

    @Column(name = "finished_at")
    private LocalDate finishedAt;

    @Column(name = "read_count")
    private Integer readCount = 0;

    @Column(name = "is_active", nullable = false)
    private boolean isActive; // 1 = active | 0 = inactive

}
