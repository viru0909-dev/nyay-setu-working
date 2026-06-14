# Pull Request

## Description
This PR resolves N+1 query performance issues in the backend service. Specifically, it updates CaseRepository and DocumentRepository to use JPA Entity Graphs (@EntityGraph), which allows fetching cases and their associated documents in a single query rather than executing N+1 queries. It also updates the corresponding test cases (CaseDocumentEntityGraphTest) to flush and clear the entity manager before fetching to guarantee that entities are loaded correctly from the database.

Closes #1158

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
